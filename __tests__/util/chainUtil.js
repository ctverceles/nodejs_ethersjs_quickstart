/**
 * helper file for chain unit tests
 * 
 * @package: Life
 * @author:  Chris Verceles <chris@lifeme.sh>
 * @since:   2019-01-02

 */

module.exports = {
    getRandomInt: (max = 10000) => {
        return Math.floor(Math.random() * Math.floor(max));
    }
};