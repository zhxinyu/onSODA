// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IERC20Detailed} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {AaveProtocolDataProvider} from "@aave/core-v3/contracts/misc/AaveProtocolDataProvider.sol";
import {IFlashLoanReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanReceiver.sol";

contract OrderDispatcher is IFlashLoanReceiver {
    constructor() {
        owner = msg.sender;
        balances[owner] = 0;
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {

    }

    address constant IPoolAddressesProviderAddress =
        0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb;
    address private owner;
    mapping(address => uint256) private balances;
    uint private numTransactions = 0;
    uint[] private subLengths;
    uint8[] private transactionTypes;
    uint8[] private tokens;
    uint[] private quantities;

    function getTokenAddress(uint8 idx) public view returns (address) {
        address _PoolDataProviderAddress = IPoolAddressesProvider(
            IPoolAddressesProviderAddress
        ).getPoolDataProvider();
        return
            AaveProtocolDataProvider(_PoolDataProviderAddress)
            .getAllReservesTokens()[idx].tokenAddress;
    }

    function getTokenDecimals(address token) public view returns (uint8) {
        return IERC20Detailed(token).decimals();
    }

    function resetOrderInfo() internal {
        numTransactions = 0;
        delete subLengths;
        delete transactionTypes;
        delete tokens;
        delete quantities;
    }

    function parseOrder(string memory compressedOrder) public {
        bytes memory bytesOrder = bytes(compressedOrder);
        // uint memory
        resetOrderInfo();
        uint totalLength = bytesOrder.length;
        uint8 state = 0; // 0: numTransactions
        // 1: subLength
        // 2: TransactionType
        // 3: Token
        // 4: Quantity also need to keep track of current remaining items in the subLength.
        // when hit ",", state transition: (0->1), (1->2), (2->3),(3->4),
        //                                 (4->1) (if currentRemainingSubLength == 0),
        //                                 (4->2) (if currentRemainingSubLength > 0)
        uint currentRemainingSubLength = 0;
        uint8 transactionType = 0;
        uint8 token = 0;
        uint quantity = 0;
        bool hitPeriod = false;
        uint8 tokenDecimals = 18;
        for (uint i = 0; i < totalLength; i++) {
            require(
                uint8(bytesOrder[i]) == 44 ||
                    uint8(bytesOrder[i]) == 46 ||
                    (uint8(bytesOrder[i]) >= 48 && uint8(bytesOrder[i]) <= 57),
                "each byte can only be '.', ',', 0, 1,2,3,4,5,6,7,8,9 "
            );
            if (uint8(bytesOrder[i]) == 44) {
                // if it is a comma sign. It indicates state transition.
                if (state != 4) {
                    if (state == 0) {
                        // finish reading numTransactions data.
                        require(currentRemainingSubLength == 0, "by design.");
                    } else if (state == 1) {
                        // finish reading subLength data.
                        subLengths.push(currentRemainingSubLength);
                    } else if (state == 2) {
                        // finish reading TransactionType data.
                        transactionTypes.push(transactionType);
                    } else {
                        // finish reading Token data.
                        tokens.push(token);
                        tokenDecimals = getTokenDecimals(
                            getTokenAddress(token)
                        );
                    }
                    state += 1;
                } else {
                    // finish reading quantity data.
                    // From 4->1 or 4->2. We need to clean up the current recorded tx, token and quantity.
                    quantities.push(quantity);
                    if (currentRemainingSubLength > 0) {
                        state = 2;
                        currentRemainingSubLength--;
                    } else {
                        state = 1;
                    }
                    transactionType = 0;
                    token = 0;
                    quantity = 0;
                    hitPeriod = false;
                    tokenDecimals = 18;
                }
            } else {
                if (state == 0) {
                    // reading numTransactions
                    numTransactions =
                        10 *
                        numTransactions +
                        uint(uint8(bytesOrder[i])) -
                        48;
                } else if (state == 1) {
                    // reading subLength
                    currentRemainingSubLength =
                        10 *
                        currentRemainingSubLength +
                        uint(uint8(bytesOrder[i])) -
                        48;
                } else if (state == 2) {
                    // reading transactionType
                    transactionType =
                        10 *
                        transactionType +
                        uint8(bytesOrder[i]) -
                        48;
                } else if (state == 3) {
                    // reading token
                    token = 10 * token + uint8(bytesOrder[i]) - 48;
                } else {
                    // reading quantity
                    if (uint8(bytesOrder[i]) == 46) {
                        // hit period
                        hitPeriod = true;
                        quantity = quantity * (10**tokenDecimals);
                    } else {
                        if (hitPeriod == true) {
                            tokenDecimals--;
                            quantity +=
                                (uint(uint8(bytesOrder[i])) - 48) *
                                (10**tokenDecimals);
                        } else {
                            quantity =
                                10 *
                                quantity +
                                uint(uint8(bytesOrder[i])) -
                                48;
                        }
                    }
                }
            }
        }
        // finish the last read.
        quantities.push(quantity);
        require(
            currentRemainingSubLength == 0,
            "By design, currentRemainingSubLength should be zero at the end"
        );
        state = 0;
        transactionType = 0;
        token = 0;
        quantity = 0;
        hitPeriod = false;
        tokenDecimals = 18;
    }

    function dispatchOrder(address _user, string memory compressedOrder)
        public
        payable
    {
        parseOrder(compressedOrder);
        address _pool = IPoolAddressesProvider(IPoolAddressesProviderAddress)
            .getPool();
        require(
            _pool == 0x794a61358D6845594F94dc1DB02A252b5b4814aD,
            "Wrong pool address!"
        );
        uint offset = 0;
        uint amount = 0;
        address token;
        for (uint i = 0; i < numTransactions; i++) {
            for (uint j = 0; j < subLengths[i] + 1; j++) {
                amount = quantities[offset + j];
                token = getTokenAddress(tokens[offset + j]);
                if (transactionTypes[offset + j] == 0) {
                    // supply
                    require(
                        IERC20(token).balanceOf(_user) >= amount,
                        "Not Enough fund"
                    );
                    IERC20(token).transferFrom(_user, address(this), amount);
                    IERC20(token).approve(_pool, 0);
                    IERC20(token).approve(_pool, amount);
                    IPool(_pool).supply(token, amount, _user, 0);
                } else if (transactionTypes[offset + j] == 1) {
                    // swap
                    require(false, "not supported yet.");
                } else if (transactionTypes[offset + j] == 2) {
                    // borrow
                    IPool(_pool).borrow(token, amount, 1, 0, _user);
                } else if (transactionTypes[offset + j] == 3) {
                    // flashloan
                    require(false, "not supported yet.");
                    IERC20(token).approve(_pool, 0);
                    IERC20(token).approve(_pool, amount * 2);
                    IPool(_pool).flashLoanSimple(
                        address(this),
                        token,
                        amount,
                        "",
                        0
                    );
                } else {
                    // repay
                    require(transactionTypes[offset + j] == 4, "by design");
                    IERC20(token).approve(_pool, 0);
                    IERC20(token).approve(_pool, amount);
                    IPool(_pool).repay(token, amount, 1, _user);
                }
            }
            offset += subLengths[i] + 1;
        }
    }

    function submitOrder(
        address pool,
        address token,
        uint amount,
        address user
    ) public payable {
        require(IERC20(token).balanceOf(user) >= amount, "Not Enough fund");
        IERC20(token).transferFrom(user, address(this), amount);
        IERC20(token).approve(pool, 0);
        IERC20(token).approve(pool, amount);
        IPool(pool).supply(token, amount, user, 0);
        IPool(pool).borrow(token, amount/2, 1, 0, user);
    }

    function balanceOf(address _address)
        external
        view
        returns (uint256 result)
    {
        result = balances[_address];
    }

    function put() external payable {
        require(msg.sender.balance >= msg.value, "Not Enough fund");
        balances[msg.sender] += msg.value;
    }

    function getNumTransactions() public view returns (uint) {
        return numTransactions;
    }

    function getSubLengths() public view returns (uint[] memory) {
        return subLengths;
    }

    function getTransactionTypes() public view returns (uint8[] memory) {
        return transactionTypes;
    }

    function getTokens() public view returns (uint8[] memory) {
        return tokens;
    }

    function getQuantites() public view returns (uint[] memory) {
        return quantities;
    }

    function ADDRESSES_PROVIDER()
        external
        pure
        override
        returns (IPoolAddressesProvider){
            return IPoolAddressesProvider(IPoolAddressesProviderAddress);
    }

    function POOL() external view override returns (IPool) {
        address _pool = IPoolAddressesProvider(IPoolAddressesProviderAddress).getPool();
        return IPool(_pool);
    }
}
