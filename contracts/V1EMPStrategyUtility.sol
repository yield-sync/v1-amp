
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";

import { IV1EMPStrategy } from "./interface/IV1EMPStrategy.sol";
import {
	IV1EMPArrayUtility,
	IV1EMPETHValueFeed,
	IV1EMPRegistry,
	IV1EMPStrategyUtility,
	UtilizationERC20
} from "./interface/IV1EMPStrategyUtility.sol";


contract V1EMPStrategyUtility is
	IV1EMPStrategyUtility
{
	using SafeMath for uint256;


	IV1EMPArrayUtility public immutable I_V1_EMP_ARRAY_UTILITY;
	IV1EMPRegistry public immutable I_V1_EMP_REGISTRY;


	constructor (address _v1EMPRegistry)
	{
		I_V1_EMP_REGISTRY = IV1EMPRegistry(_v1EMPRegistry);
		I_V1_EMP_ARRAY_UTILITY = IV1EMPArrayUtility(I_V1_EMP_REGISTRY.v1EMPArrayUtility());
	}


	modifier authEMPStrategy()
	{
		require(I_V1_EMP_REGISTRY.v1EMPStrategy_v1EMPStrategyId(msg.sender) > 0, "!authorized");

		_;
	}


	function depositAmountsValidator(uint256[] memory _utilizedERC20Amount)
		public
		view
		authEMPStrategy()
	{
		IV1EMPStrategy iV1EMPStrategy = IV1EMPStrategy(msg.sender);

		address[] memory _utilizedERC20 =  iV1EMPStrategy.utilizedERC20();

		require(_utilizedERC20.length == _utilizedERC20Amount.length, "!(_utilizedERC20.length == _utilizedERC20Amount.length)");

		(
			uint256 utilizedERC20AmountETHValueTotal_,
			uint256[] memory utilizedERC20AmountETHValue_
		) = iV1EMPStrategy.utilizedERC20AmountETHValue(_utilizedERC20Amount);

		for (uint256 i = 0; i < _utilizedERC20.length; i++)
		{
			if (!iV1EMPStrategy.utilizedERC20_utilizationERC20(_utilizedERC20[i]).deposit)
			{
				require(_utilizedERC20Amount[i] == 0, "!(_utilizedERC20Amount[i] == 0)");
			}

			uint256 utilizedERC20AmountAllocationActual = utilizedERC20AmountETHValue_[i].mul(1e18).div(
				utilizedERC20AmountETHValueTotal_,
				"!computed"
			);

			require(
				iV1EMPStrategy.utilizedERC20_utilizationERC20(_utilizedERC20[i]).allocation == utilizedERC20AmountAllocationActual,
				"!(_utilizedERC20_utilizationERC20[_utilizedERC20[i]].allocation == utilizedERC20AmountAllocationActual)"
			);
		}

		return;
	}

	function utilizedERC20Sort(address[] memory _utilizedERC20)
		public
		view
		returns (address[] memory)
	{
		return I_V1_EMP_ARRAY_UTILITY.sort(_utilizedERC20);
	}

	function utilizedERC20UpdateValidator(address[] memory _utilizedERC20, UtilizationERC20[] memory _utilizationERC20)
		public
	{
		require(_utilizedERC20.length == _utilizationERC20.length, "!(__utilizedERC20.length == _utilizationERC20.length)");

		require(
			!I_V1_EMP_ARRAY_UTILITY.containsDuplicates(_utilizedERC20),
			"I_V1_EMP_ARRAY_UTILITY.containsDuplicates(_utilizedERC20)"
		);

		uint256 utilizedERC20AllocationTotal;

		for (uint256 i = 0; i < _utilizedERC20.length; i++)
		{
			require(
				I_V1_EMP_REGISTRY.eRC20_v1EMPERC20ETHValueFeed(_utilizedERC20[i]) != address(0),
				"!(I_V1_EMP_REGISTRY.eRC20_v1EMPERC20ETHValueFeed(_utilizedERC20[i]) != address(0))"
			);

			if (_utilizationERC20[i].deposit)
			{
				utilizedERC20AllocationTotal += _utilizationERC20[i].allocation;
			}
		}

		require(
			utilizedERC20AllocationTotal == IV1EMPStrategy(msg.sender).ONE_HUNDRED_PERCENT(),
			"!(utilizedERC20AllocationTotal == IV1EMPStrategy(msg.sender).ONE_HUNDRED_PERCENT())"
		);
	}
}
