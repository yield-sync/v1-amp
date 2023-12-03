// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


using SafeERC20 for IERC20;


struct Allocation
{
	uint8 denominator;
	uint8 numerator;
}


interface IYieldSyncV1Strategy
{
	function positionETHValue(address[] memory _utilizedToken, address _target)
		external
		view
		returns (uint256 positionETHValue_)
	;

	function utilizedTokenETHValue(address _token)
		external
		view
		returns (uint256 tokenETHValue_)
	;

	/**
	* @notice
	* @param _utilizedToken {address[]}
	* @param _utilizedToken {uint256[]}
	*/
	function utilizedTokenDeposit(address[] memory _utilizedToken, uint256[] memory _amount)
		external
	;

	/**
	* @notice
	* @param _utilizedToken {address[]}
	* @param _utilizedToken {uint256[]}
	*/
	function utilizedTokenWithdraw(address[] memory _utilizedToken, uint256[] memory _amount)
		external
	;

	/**
	* @notice Return total amoutns lockeds
	*/
	function utilizedTokenAmount()
		external
		returns (uint256[] memory utilizedTokenAmount_)
	;
}

interface IYieldSyncV1StrategyManager is
	IERC20
{
	/**
	* @notice
	* @dev [view-address]
	* @return {address}
	*/
	function strategy()
		external
		view
		returns (address)
	;

	/**
	* @notice token to allocation
	* @dev [view-mapping]
	* @param _token {address}
	* @return {Allocation}
	*/
	function token_allocation(address _token)
		external
		view
		returns (Allocation memory)
	;

	/**
	* @notice token to utilized
	* @dev [view-mapping]
	* @param _token {address}
	* @return utilized_ {bool}
	*/
	function token_utilized(address _token)
		external
		view
		returns (bool utilized_)
	;


	/**
	* @notice Value of position denominated in WETH
	* @param target {address}
	* @return positionETHValue_ {uint256}
	*/
	function positionETHValue(address target)
		external
		view
		returns (uint256 positionETHValue_)
	;


	/**
	* @notice Array of utilized tokens
	* @return utilizedToken_ {address[]}
	*/
	function utilizedToken()
		external
		view
		returns (address[] memory utilizedToken_)
	;

	/**
	* @notice Return value of token denominated in WETH
	* @param _token {uint256}
	* @return tokenETHValue_ {uint256}
	*/
	function utilizedTokenETHValue(address _token)
		external
		view
		returns (uint256 tokenETHValue_)
	;

	/**
	* @notice Deposit into strategy
	* @param _amount {uint256[]} Amount to be deposited
	*/
	function utilizedTokenDeposit(uint256[] memory _amount)
		external
	;

	/**
	* @notice Withdraw from strategy
	* @param _amount {uint256[]} Amount to be withdrawn
	*/
	function utilizedTokenWithdraw(uint256[] memory _amount)
		external
	;
}
