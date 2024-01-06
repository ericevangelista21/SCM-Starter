// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    uint256 public nikePrice = 100;
    uint256 public adidasPrice = 80;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ShoeBought(string brand, uint256 price);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        emit Withdraw(_withdrawAmount);
    }

    function buyShoe(string memory brand) public {
        uint256 shoePrice;
        if (keccak256(abi.encodePacked(brand)) == keccak256(abi.encodePacked("nike"))) {
            shoePrice = nikePrice;
        } else if (keccak256(abi.encodePacked(brand)) == keccak256(abi.encodePacked("adidas"))) {
            shoePrice = adidasPrice;
        } else {
            revert("Invalid brand");
        }

        require(balance >= shoePrice, "Insufficient funds to buy shoe");
        balance -= shoePrice;
        emit ShoeBought(brand, shoePrice);
    }
}