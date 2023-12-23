const { ethers } = require("hardhat");


import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";

const HUNDRED_PERCENT = ethers.utils.parseUnits('1', 18);
const FIFTY_PERCENT = ethers.utils.parseUnits('.5', 18);
const TWENTY_FIVE_PERCENT = ethers.utils.parseUnits('.25', 18);
const SEVENTY_FIVE_PERCENT = ethers.utils.parseUnits('.75', 18);


describe("[0.1] YieldSyncV1VaultDeployer.sol - Withdraw", async () => {
	let mockERC20A: Contract;
	let mockERC20B: Contract;
	let mockERC206: Contract;
	let strategyInteractorBlank: Contract;
	let yieldSyncV1AMPStrategy: Contract;

	beforeEach("[beforeEach] Set up contracts..", async () => {
		const [owner] = await ethers.getSigners();

		const MockERC20: ContractFactory = await ethers.getContractFactory("MockERC20");
		const MockERC206: ContractFactory = await ethers.getContractFactory("MockERC206");
		const StrategyInteractorBlank: ContractFactory = await ethers.getContractFactory("StrategyInteractorBlank");
		const YieldSyncV1AMPStrategy: ContractFactory = await ethers.getContractFactory("YieldSyncV1AMPStrategy");

		mockERC20A = await (await MockERC20.deploy()).deployed();
		mockERC20B = await (await MockERC20.deploy()).deployed();
		mockERC206 = await (await MockERC206.deploy()).deployed();
		strategyInteractorBlank = await (await StrategyInteractorBlank.deploy()).deployed();
		yieldSyncV1AMPStrategy = await (await YieldSyncV1AMPStrategy.deploy(owner.address, "Exampe", "EX")).deployed();
	});

	describe("function utilizedERC20Withdraw()", async () => {
		it(
			"[100] Should allow caller to burn ERC20 and cash out..",
			async () => {
				const [owner] = await ethers.getSigners();

				// Initialize strategy with mock ERC20
				await expect(
					yieldSyncV1AMPStrategy.initializeStrategy(
						strategyInteractorBlank.address,
						[mockERC20A.address],
						[HUNDRED_PERCENT]
					)
				).to.not.be.reverted;

				const strategyTotalSupplyBefore = await yieldSyncV1AMPStrategy.totalSupply();

				const strategyInteractorMockERC20ABalanceBefore = await mockERC20A.balanceOf(
					strategyInteractorBlank.address
				);

				const ownerMockERC20ABalanceBefore = await mockERC20A.balanceOf(owner.address);

				const mockERC20AdepositAmount = ethers.utils.parseUnits("1", 18);

				// Approve the StrategyInteractorBlank contract to spend tokens on behalf of owner
				await mockERC20A.approve(strategyInteractorBlank.address, mockERC20AdepositAmount);

				// Deposit mockERC20A tokens into the strategy
				yieldSyncV1AMPStrategy.utilizedERC20Deposit([mockERC20AdepositAmount])

				// mockERC20A BalanceOf strategy interactor should equal to deposit amount
				expect(await mockERC20A.balanceOf(strategyInteractorBlank.address)).to.be.equal(
					strategyInteractorMockERC20ABalanceBefore.add(mockERC20AdepositAmount)
				);

				// Strategy totalSupply has increased
				expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.greaterThan(strategyTotalSupplyBefore);

				// Strategy BalanceOf owner should be newly minted tokens (Current Supply - Before supply)
				expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
					(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).sub(strategyTotalSupplyBefore)
				);

				// [main-test] Withdraw ERC20 tokens into the strategy
				await expect(
					yieldSyncV1AMPStrategy.utilizedERC20Withdraw(await yieldSyncV1AMPStrategy.balanceOf(owner.address))
				).to.be.not.reverted;

				// Strategy token burned
				expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
					strategyInteractorMockERC20ABalanceBefore
				);

				// Supply put back to original
				expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.equal(strategyTotalSupplyBefore);

				// Check that the balance been returned to original or greater
				expect(await mockERC20A.balanceOf(owner.address)).to.be.greaterThanOrEqual(ownerMockERC20ABalanceBefore);
			}
		);

		describe("MULTIPLE ERC20", async () => {
			it(
				"[50/50] Should allow caller to burn ERC20 and cash out..",
				async () => {
					const [owner] = await ethers.getSigners();

					// Initialize strategy with mock ERC20
					await expect(
						yieldSyncV1AMPStrategy.initializeStrategy(
							strategyInteractorBlank.address,
							[mockERC20A.address, mockERC20B.address],
							[FIFTY_PERCENT, FIFTY_PERCENT]
						)
					).to.not.be.reverted;

					const strategyTotalSupplyBefore = await yieldSyncV1AMPStrategy.totalSupply();

					const strategyInteractorMockERC20ABalanceBefore = await mockERC20A.balanceOf(
						strategyInteractorBlank.address
					);

					const strategyInteractorMockERC20BBalanceBefore = await mockERC20B.balanceOf(
						strategyInteractorBlank.address
					);

					const ownerMockERC20ABalanceBefore = await mockERC20A.balanceOf(owner.address);
					const ownerMockERC20BBalanceBefore = await mockERC20B.balanceOf(owner.address);

					const mockERC20DepositAmount = ethers.utils.parseUnits("1", 18);

					// Approve the StrategyInteractorBlank contract to spend tokens on behalf of owner
					await mockERC20A.approve(strategyInteractorBlank.address, mockERC20DepositAmount);
					await mockERC20B.approve(strategyInteractorBlank.address, mockERC20DepositAmount);

					// Deposit mockERC20A tokens into the strategy
					yieldSyncV1AMPStrategy.utilizedERC20Deposit([mockERC20DepositAmount, mockERC20DepositAmount])

					// mockERC20A BalanceOf strategy interactor should equal to deposit amount
					expect(await mockERC20A.balanceOf(strategyInteractorBlank.address)).to.be.equal(
						strategyInteractorMockERC20ABalanceBefore.add(mockERC20DepositAmount)
					);

					// mockERC20B BalanceOf strategy interactor should equal to deposit amount
					expect(await mockERC20B.balanceOf(strategyInteractorBlank.address)).to.be.equal(
						strategyInteractorMockERC20BBalanceBefore.add(mockERC20DepositAmount)
					);

					// Strategy totalSupply has increased
					expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.greaterThan(strategyTotalSupplyBefore);

					// Strategy BalanceOf owner should be newly minted tokens (Current Supply - Before supply)
					expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
						(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).sub(strategyTotalSupplyBefore)
					);

					// [main-test] Withdraw ERC20 tokens into the strategy
					await expect(
						yieldSyncV1AMPStrategy.utilizedERC20Withdraw(await yieldSyncV1AMPStrategy.balanceOf(owner.address))
					).to.be.not.reverted;


					// Strategy token burned
					expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
						strategyInteractorMockERC20ABalanceBefore
					);

					// Supply put back to original
					expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.equal(strategyTotalSupplyBefore);

					// Check that the balance been returned to original or greater
					expect(await mockERC20A.balanceOf(owner.address)).to.be.greaterThanOrEqual(ownerMockERC20ABalanceBefore);

					// Check that the balance been returned to original or greater
					expect(await mockERC20B.balanceOf(owner.address)).to.be.greaterThanOrEqual(ownerMockERC20BBalanceBefore);
				}
			);

			it(
				"[75/25] Should allow caller to burn ERC20 and cash out..",
				async () => {
					const [owner] = await ethers.getSigners();

					// Initialize strategy with mock ERC20
					await expect(
						yieldSyncV1AMPStrategy.initializeStrategy(
							strategyInteractorBlank.address,
							[mockERC20A.address, mockERC20B.address],
							[SEVENTY_FIVE_PERCENT, TWENTY_FIVE_PERCENT]
						)
					).to.not.be.reverted;

					const strategyTotalSupplyBefore = await yieldSyncV1AMPStrategy.totalSupply();

					const strategyInteractorMockERC20ABalanceBefore = await mockERC20A.balanceOf(
						strategyInteractorBlank.address
					);

					const strategyInteractorMockERC20BBalanceBefore = await mockERC20B.balanceOf(
						strategyInteractorBlank.address
					);

					const ownerMockERC20ABalanceBefore = await mockERC20A.balanceOf(owner.address);
					const ownerMockERC20BBalanceBefore = await mockERC20B.balanceOf(owner.address);

					const mockERC20ADepositAmount = ethers.utils.parseUnits(".75", 18);
					const mockERC20BDepositAmount = ethers.utils.parseUnits(".25", 18);

					// Approve the StrategyInteractorBlank contract to spend tokens on behalf of owner
					await mockERC20A.approve(strategyInteractorBlank.address, mockERC20ADepositAmount);
					await mockERC20B.approve(strategyInteractorBlank.address, mockERC20BDepositAmount);

					// Deposit mockERC20A tokens into the strategy
					yieldSyncV1AMPStrategy.utilizedERC20Deposit([mockERC20ADepositAmount, mockERC20BDepositAmount])

					// mockERC20A BalanceOf strategy interactor should equal to deposit amount
					expect(await mockERC20A.balanceOf(strategyInteractorBlank.address)).to.be.equal(
						strategyInteractorMockERC20ABalanceBefore.add(mockERC20ADepositAmount)
					);

					// mockERC20B BalanceOf strategy interactor should equal to deposit amount
					expect(await mockERC20B.balanceOf(strategyInteractorBlank.address)).to.be.equal(
						strategyInteractorMockERC20BBalanceBefore.add(mockERC20BDepositAmount)
					);

					// Strategy totalSupply has increased
					expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.greaterThan(strategyTotalSupplyBefore);

					// Strategy BalanceOf owner should be newly minted tokens (Current Supply - Before supply)
					expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
						(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).sub(strategyTotalSupplyBefore)
					);

					// [main-test] Withdraw ERC20 tokens into the strategy
					await expect(
						yieldSyncV1AMPStrategy.utilizedERC20Withdraw(await yieldSyncV1AMPStrategy.balanceOf(owner.address))
					).to.be.not.reverted;


					// Strategy token burned
					expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
						strategyInteractorMockERC20ABalanceBefore
					);

					// Supply put back to original
					expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.equal(strategyTotalSupplyBefore);

					// Check that the balance been returned to original or greater
					expect(await mockERC20A.balanceOf(owner.address)).to.be.greaterThanOrEqual(ownerMockERC20ABalanceBefore);

					// Check that the balance been returned to original or greater
					expect(await mockERC20B.balanceOf(owner.address)).to.be.greaterThanOrEqual(ownerMockERC20BBalanceBefore);
				}
			);

			describe("ERC20 with 6 decimals", async () => {
				it(
					"[50/50] Should allow caller to burn ERC20 and cash out..",
					async () => {
						const [owner] = await ethers.getSigners();

						// Initialize strategy with mock ERC20
						await expect(
							yieldSyncV1AMPStrategy.initializeStrategy(
								strategyInteractorBlank.address,
								[mockERC20A.address, mockERC206.address],
								[FIFTY_PERCENT, FIFTY_PERCENT]
							)
						).to.not.be.reverted;

						const strategyTotalSupplyBefore = await yieldSyncV1AMPStrategy.totalSupply();

						const strategyInteractorMockERC20ABalanceBefore = await mockERC20A.balanceOf(
							strategyInteractorBlank.address
						);

						const strategyInteractorMockERC206BalanceBefore = await mockERC206.balanceOf(
							strategyInteractorBlank.address
						);

						const ownerMockERC20ABalanceBefore = await mockERC20A.balanceOf(owner.address);
						const ownerMockERC206BalanceBefore = await mockERC206.balanceOf(owner.address);

						const mockERC20ADepositAmount = ethers.utils.parseUnits("1", 18);
						const mockERC206DepositAmount = ethers.utils.parseUnits("1", 6);

						// Approve the StrategyInteractorBlank contract to spend tokens on behalf of owner
						await mockERC20A.approve(strategyInteractorBlank.address, mockERC20ADepositAmount);
						await mockERC206.approve(strategyInteractorBlank.address, mockERC206DepositAmount);

						// Deposit mockERC20A tokens into the strategy
						yieldSyncV1AMPStrategy.utilizedERC20Deposit([mockERC20ADepositAmount, mockERC206DepositAmount])

						// mockERC20A BalanceOf strategy interactor should equal to deposit amount
						expect(await mockERC20A.balanceOf(strategyInteractorBlank.address)).to.be.equal(
							strategyInteractorMockERC20ABalanceBefore.add(mockERC20ADepositAmount)
						);

						// mockERC206 BalanceOf strategy interactor should equal to deposit amount
						expect(await mockERC206.balanceOf(strategyInteractorBlank.address)).to.be.equal(
							strategyInteractorMockERC206BalanceBefore.add(mockERC206DepositAmount)
						);

						// Strategy totalSupply has increased
						expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.greaterThan(strategyTotalSupplyBefore);

						// Strategy BalanceOf owner should be newly minted tokens (Current Supply - Before supply)
						expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
							(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).sub(strategyTotalSupplyBefore)
						);

						// [main-test] Withdraw ERC20 tokens into the strategy
						await expect(
							yieldSyncV1AMPStrategy.utilizedERC20Withdraw(await yieldSyncV1AMPStrategy.balanceOf(owner.address))
						).to.be.not.reverted;


						// Strategy token burned
						expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
							strategyInteractorMockERC20ABalanceBefore
						);

						// Supply put back to original
						expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.equal(strategyTotalSupplyBefore);

						// Check that the balance been returned to original or greater
						expect(await mockERC20A.balanceOf(owner.address)).to.be.greaterThanOrEqual(
							ownerMockERC20ABalanceBefore
						);

						// Check that the balance been returned to original or greater
						expect(await mockERC206.balanceOf(owner.address)).to.be.greaterThanOrEqual(
							ownerMockERC206BalanceBefore
						);
					}
				);

				it(
					"[75/25] Should allow caller to burn ERC20 and cash out..",
					async () => {
						const [owner] = await ethers.getSigners();

						// Initialize strategy with mock ERC20
						await expect(
							yieldSyncV1AMPStrategy.initializeStrategy(
								strategyInteractorBlank.address,
								[mockERC20A.address, mockERC206.address],
								[SEVENTY_FIVE_PERCENT, TWENTY_FIVE_PERCENT]
							)
						).to.not.be.reverted;

						const strategyTotalSupplyBefore = await yieldSyncV1AMPStrategy.totalSupply();

						const strategyInteractorMockERC20ABalanceBefore = await mockERC20A.balanceOf(
							strategyInteractorBlank.address
						);

						const strategyInteractorMockERC206BalanceBefore = await mockERC206.balanceOf(
							strategyInteractorBlank.address
						);

						const ownerMockERC20ABalanceBefore = await mockERC20A.balanceOf(owner.address);
						const ownerMockERC206BalanceBefore = await mockERC206.balanceOf(owner.address);

						const mockERC20ADepositAmount = ethers.utils.parseUnits(".75", 18);
						const mockERC206DepositAmount = ethers.utils.parseUnits(".25", 6);

						// Approve the StrategyInteractorBlank contract to spend tokens on behalf of owner
						await mockERC20A.approve(strategyInteractorBlank.address, mockERC20ADepositAmount);
						await mockERC206.approve(strategyInteractorBlank.address, mockERC206DepositAmount);

						// Deposit mockERC20A tokens into the strategy
						yieldSyncV1AMPStrategy.utilizedERC20Deposit([mockERC20ADepositAmount, mockERC206DepositAmount])

						// mockERC20A BalanceOf strategy interactor should equal to deposit amount
						expect(await mockERC20A.balanceOf(strategyInteractorBlank.address)).to.be.equal(
							strategyInteractorMockERC20ABalanceBefore.add(mockERC20ADepositAmount)
						);

						// mockERC206 BalanceOf strategy interactor should equal to deposit amount
						expect(await mockERC206.balanceOf(strategyInteractorBlank.address)).to.be.equal(
							strategyInteractorMockERC206BalanceBefore.add(mockERC206DepositAmount)
						);

						// Strategy totalSupply has increased
						expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.greaterThan(strategyTotalSupplyBefore);

						// Strategy BalanceOf owner should be newly minted tokens (Current Supply - Before supply)
						expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
							(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).sub(strategyTotalSupplyBefore)
						);

						// [main-test] Withdraw ERC20 tokens into the strategy
						await expect(
							yieldSyncV1AMPStrategy.utilizedERC20Withdraw(await yieldSyncV1AMPStrategy.balanceOf(owner.address))
						).to.be.not.reverted;


						// Strategy token burned
						expect(await yieldSyncV1AMPStrategy.balanceOf(owner.address)).to.be.equal(
							strategyInteractorMockERC20ABalanceBefore
						);

						// Supply put back to original
						expect(await yieldSyncV1AMPStrategy.totalSupply()).to.be.equal(strategyTotalSupplyBefore);

						// Check that the balance been returned to original or greater
						expect(await mockERC20A.balanceOf(owner.address)).to.be.greaterThanOrEqual(
							ownerMockERC20ABalanceBefore
						);

						// Check that the balance been returned to original or greater
						expect(await mockERC206.balanceOf(owner.address)).to.be.greaterThanOrEqual(
							ownerMockERC206BalanceBefore
						);
					}
				);
			});
		});
	});
});