pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ERC20Sample is ERC20 {
    string public constant symbol = "BLA";
    string public constant name = "BLA Token";
    uint8 public constant decimals = 2;
    string public constant version = "1.0";

    constructor () public {
    }
}