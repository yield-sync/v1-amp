const { ethers } = require("hardhat");


import { expect } from "chai";
import { Contract, VoidSigner } from "ethers";

import { ERROR } from "../const";
import { deployContract } from "../util/UtilEMP";


describe("[2.0] V1EMPStrategyUtility.sol", async () => {
	let arrayUtility: Contract;
	let governance: Contract;
	let registry: Contract;
	let utility: Contract;

	let treasury: VoidSigner;


	beforeEach("[beforeEach] Set up contracts..", async () => {
		[, , treasury] = await ethers.getSigners();

		governance = await deployContract("@yield-sync/governance/contracts/YieldSyncGovernance.sol:YieldSyncGovernance");
		arrayUtility = await deployContract("V1EMPArrayUtility");
		registry = await deployContract("V1EMPRegistry", [governance.address]);
		utility = await deployContract("V1EMPStrategyUtility", [registry.address]);

		await governance.payToUpdate(treasury.address);
		await registry.v1EMPArrayUtilityUpdate(arrayUtility.address);
		await registry.v1EMPStrategyDeployerUpdate(utility.address);
	});


	describe("view", async () => {
		describe("function depositAmountsValid()", async () => {
			describe("Expected Failure", async () => {
				it("[modifier] Should only be able to pass a valid EMP STRATEGY address..", async () => {
					await expect(
						utility.depositAmountsValid(ethers.constants.AddressZero, [])
					).to.be.rejectedWith(
						ERROR.STRATEGY_UTILITY.ADDRESS_NOT_STRATEGY
					);
				});
			});
		});

		describe("function utilizedERC20AmountETHValue()", async () => {
			describe("Expected Failure", async () => {
				it("[modifier] Should only be able to pass a valid EMP STRATEGY address..", async () => {
					await expect(
						utility.utilizedERC20AmountETHValue(ethers.constants.AddressZero, [])
					).to.be.rejectedWith(
						ERROR.STRATEGY_UTILITY.ADDRESS_NOT_STRATEGY
					);
				});
			});
		});
	});

	describe("mutatitive", async () => {
		describe("function utilizedERC20UpdateValid()", async () => {
			describe("Expected Failure", async () => {
				it("[modifier] Should only be able to pass a valid EMP STRATEGY address..", async () => {
					await expect(
						utility.utilizedERC20UpdateValid(ethers.constants.AddressZero, [], [])
					).to.be.rejectedWith(
						ERROR.STRATEGY_UTILITY.ADDRESS_NOT_STRATEGY
					);
				});
			});
		});
	});
});
