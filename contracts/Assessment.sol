// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    mapping(string => uint256) public currencyConversionRate;

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        
        // Initialize currency conversion rates
        currencyConversionRate["ETH"] = 1;
        currencyConversionRate["SOL"] = 100;
        currencyConversionRate["BTC"] = 100;
        currencyConversionRate["MATIC"] = 1000;
        currencyConversionRate["AVAX"] = 400;
        currencyConversionRate["ADA"] = 200;
        currencyConversionRate["DOT"] = 50;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({ balance: balance, withdrawAmount: _withdrawAmount });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function convertCurrency(uint256 _amount, string memory _fromCurrency, string memory _toCurrency) public view returns (uint256) {
        require(currencyConversionRate[_fromCurrency] > 0, "Invalid conversion source currency");
        require(currencyConversionRate[_toCurrency] > 0, "Invalid conversion target currency");
        
        uint256 convertedAmount = (_amount * currencyConversionRate[_fromCurrency]) / currencyConversionRate[_toCurrency];
        return convertedAmount;
    }

    function viewPrices() public view returns (string memory) {
        string memory prices;
        for (uint i = 0; i < currencyNames.length; i++) {
            string memory currency = currencyNames[i];
            prices = string(abi.encodePacked(prices, "1 ETH = ", uintToString(currencyConversionRate[currency]), " ", currency, "\n"));
        }
        return prices;
    }
    
    // Helper function to convert uint to string
    function uintToString(uint v) internal pure returns (string memory) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1];
        }
        return string(s);
    }
    
    // Array of currency names
    string[] public currencyNames = ["ETH", "SOL", "BTC", "MATIC", "AVAX", "ADA", "DOT"];
}
