// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IYieldSyncV1AssetAllocator is
	IERC20
{
	/**
	* @notice Allocate funds to strategies
	*/
	function strategy()
		external
		view
		returns (address[] memory)
	;


	/**
	* @notice Allocate funds to strategies
	*/
	function allocate()
		external
	;

	/**
	* @notice Update a strategy allocation
	* @param __strategy {address}
	* @param numerator {uint8}
	* @param denominator {uint8}
	*/
	function strategyAllocationUpdate(address __strategy, uint8 denominator, uint8 numerator)
		external
	;

	/**
	* @notice Add a strategy
	*/
	function strategyAdd(address __strategy, uint8 denominator, uint8 numerator)
		external
	;

	/**
	* @notice Subtract a strategy
	* @param __strategy {address}
	*/
	function strategySubtract(address __strategy)
		external
	;

	/**
	* @notice Make withdrawal request
	*/
	function withdrawalRequestCreate()
		external
	;
}