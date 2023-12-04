
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";


import { IYieldSyncV1Strategy } from "./interface/IYieldSyncV1Strategy.sol";
import { Allocation, IERC20, IYieldSyncV1StrategyController } from "./interface/IYieldSyncV1StrategyController.sol";


contract YieldSyncV1StrategyController is
	ERC20,
	IYieldSyncV1StrategyController,
	ReentrancyGuard
{
	address public immutable deployer;
	address public override strategy;
	address[] internal _utilizedToken;


	mapping (address token => bool utilized) internal _token_utilized;

	mapping (address token => Allocation allocation) internal _token_allocation;


	receive ()
		external
		payable
	{}


	fallback ()
		external
		payable
	{}


	constructor (address _deployer, string memory _name, string memory _symbol)
		ERC20(_name, _symbol)
	{
		deployer = _deployer;
	}


	/// @inheritdoc IYieldSyncV1StrategyController
	function token_allocation(address _token)
		external
		view
		override
		returns (Allocation memory)
	{
		return _token_allocation[_token];
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function token_utilized(address _token)
		public
		view
		override
		returns (bool utilized_)
	{
		return _token_utilized[_token];
	}


	/// @inheritdoc IYieldSyncV1StrategyController
	function positionETHValue(address _target)
		public
		override
		returns (uint256 positionETHValue_)
	{
		uint256[] memory utilizedTokenAmount = utilizedTokenAmountPerToken();

		require(utilizedTokenAmount.length == _utilizedToken.length, "utilizedTokenAmount.length != _utilizedToken.length");

		uint256 calculatedPositionETHValue = 0;

		for (uint256 i = 0; i < _utilizedToken.length; i++)
		{
			calculatedPositionETHValue += utilizedTokenAmount[i] * utilizedTokenETHValue(_utilizedToken[i]) * balanceOf(
				_target
			);
		}

		return calculatedPositionETHValue;
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function setStrategy(address _strategy)
		public
	{
		require(strategy == address(0), "strategy != address(0)");
		require(msg.sender == deployer, "!deployer");

		strategy = _strategy;
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function utilizedToken()
		public
		view
		override
		returns (address[] memory)
	{
		return _utilizedToken;
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function utilizedTokenAmountPerToken()
		public
		override
		returns (uint256[] memory utilizedTokenAmount_)
	{
		uint256[] memory utilizedTokenAmount = IYieldSyncV1Strategy(strategy).utilizedTokenTotalAmount();

		require(_utilizedToken.length == utilizedTokenAmount.length , "_utilizedToken.length != utilizedTokenAmount.length");

		for (uint256 i = 0; i < _utilizedToken.length; i++)
		{
			utilizedTokenAmount[i] = utilizedTokenAmount[i] / totalSupply();
		}

		return utilizedTokenAmount;
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function utilizedTokenETHValue(address _token)
		public
		view
		override
		returns (uint256 tokenETHValue_)
	{
		require(_token_utilized[_token] == true, "!_token_utilized[_token]");

		return IYieldSyncV1Strategy(strategy).utilizedTokenETHValue(_token);
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function utilizedTokenDeposit(uint256[] memory _utilizedTokenAmount)
		public
		override
		nonReentrant()
	{
		require(_utilizedTokenAmount.length == _utilizedToken.length, "!_amount.length");

		uint256 valueBefore = positionETHValue(msg.sender);

		for (uint256 i = 0; i < _utilizedToken.length; i++)
		{
			IERC20(_utilizedToken[i]).approve(strategy, _utilizedTokenAmount[i]);
		}

		IYieldSyncV1Strategy(strategy).utilizedTokenDeposit(_utilizedToken, _utilizedTokenAmount);

		// Mint the tokens accordingly
		_mint(msg.sender, positionETHValue(msg.sender) - valueBefore);
	}

	/// @inheritdoc IYieldSyncV1StrategyController
	function utilizedTokenWithdraw(uint256 _tokenAmount)
		public
		override
		nonReentrant()
	{
		require(balanceOf(msg.sender) >= _tokenAmount, "!_tokenAmount");

		uint256[] memory _utilizedTokenAmount = utilizedTokenAmountPerToken();

		require(_utilizedTokenAmount.length == _utilizedToken.length, "!_amount.length");

		for (uint256 i = 0; i < _utilizedToken.length; i++)
		{
			_utilizedTokenAmount[i] += _utilizedTokenAmount[i] * _tokenAmount;
		}

		IYieldSyncV1Strategy(strategy).utilizedTokenWithdraw(msg.sender, _utilizedToken, _utilizedTokenAmount);

		_burn(msg.sender, _tokenAmount);
	}
}
