declare module "dexter-calculations"
/**
 * =============================================================================
 * xtzToToken entrypoint functions
 * =============================================================================
 */
/**
 * Calculate the amount of token sold for a given XTZ input and Dexter's two pool
 * values for the dexter xtzToToken entrypoint.
 *
 * @param {(bigInt|number|string)} xtzIn - XTZ amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(bigInt|null)} The amount of token that Dexter will send to the :to address in the dexter xtzToToken entrypoint.
 */
export function xtzToTokenTokenOutput(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the amount of XTZ you must pay in in order to receive a target
 * amount of token for a given in the two Dexter pools. tokenOut is considered the
 * maximum amount a user may receive. The user may receive less because of slippage.
 *
 * @param {(bigInt|number|string)} tokenOut - The amount of token that a user wants to receive. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals a token has. Must be greater than or equal to zero.
 * @returns {(bigInt|null)} The amount of XTZ the user must send to xtzToToken to get the tokenOut amount.
 */
export function xtzToTokenXtzInput(tokenOut: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the exchange rate for an XTZ to Token trade including the 0.3% fee given
 * to the liquidity providers and the penalty for trade size.
 *
 * @param {(bigInt|number|string)} xtzIn - XTZ amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function xtzToTokenExchangeRate(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Same as xtzToTokenExchangeRate but adjusted for the decimal places.
 *
 * @param {(bigInt|number|string)} xtzIn - XTZ amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals a token has. Must be greater than or equal to zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function xtzToTokenExchangeRateForDisplay(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the xtzToToken market rate for a give Dexter contract. The market
 * rate is an ideal number that doesn't include fees or penalties. In practice,
 * this rate  cannot be executed. This is used for displaying an exchange rate
 * without the trade size penalty (before a user enters an amount for display).
 *
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals a token has. Must be greater than or equal to zero.
 * @returns {(number|null)} The market rate as a float value.
 */
export function xtzToTokenMarketRate(xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the xtzToToken price impact for a given Dexter contract. Price
 * impact is a measure of how much a trade will alter the future price.
 *
 * @param {(bigInt|number|string)} xtzIn - The amount of XTZ the sender will sell to Dexter in xtzToToken.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(number|null)} - The price impact percentage as a float value.
 */
export function xtzToTokenPriceImpact(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the minimum token out to be sent to Dexter for a given max tokenOut
 * and the max allowed slippage rate the user accepts. If the exchange rate
 * has lowered less than the user's allowed slippage at the time of execution,
 * then the trade will fail.
 *
 * @param {(bigInt|number|string)} tokenOut - Token out as calculated by xtzToTokenTokenOut. Must be greater than zero.
 * @param {number} allowedSlippage - Maximum slippage rate that a user will except for an exchange. Must be between 0.00 and 1.00.
 * @returns {(bigInt|null)} The minimum token amount to send to the xtzToToken entrypoint.
 */
export function xtzToTokenMinimumTokenOutput(tokenOut: (bigInt.BigIntegerStatic | number | string), allowedSlippage: number): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the fee that liquidity providers, as a whole and not individually,
 * will receive for a given amount of XTZ sold to a dexter contract.
 *
 * @param {(bigInt|number|string)} xtzIn The amount of XTZ sold to dexter. Must be greater than zero.
 * @returns {(number|null)} The fee paid to the dexter liquidity providers.
 */
export function totalLiquidityProviderFee(xtzIn: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the fee that a single liquidity provider will receive for a given amount of
 * XTZ sold to a dexter contract.
 *
 * @param {(bigInt|number|string)} xtzIn - The amount of XTZ sold to dexter. Must be greater than zero.
 * @returns {(number|null)} The fee paid to an individual dexter liquidity provider.
 */
export function liquidityProviderFee(xtzIn: (bigInt.BigIntegerStatic | number | string), totalLiquidity: any, userLiquidity: any): (number | null);
/**
 * =============================================================================
 * tokenToXtz entrypoint functions
 * =============================================================================
 */
/**
 * Get the amount of XTZ sold for a given token input and the pool state of Dexter
 * for the Dexter tokenToXtz entrypoint.
 *
 * @param {(bigInt|number|string)} tokenIn - Token amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(bigInt|null)} The amount of XTZ that Dexter will send to the :to
 * address in the dexter tokenToXtz entrypoint.
 */
export function tokenToXtzXtzOutput(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the amount of token you must pay in in order to receive a target
 * amount of XTZ for a given Dexter pool state. xtzOut is considered the
 * maximum amount a user may receive. The user may receive less because of slippage.
 *
 * @param {(bigInt|number|string)} xtzOut - The amount of token that a user wants to receive. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals a token has. Must be greater than or equal to zero.
 * @returns {(bigInt|null)} The amount of token the user must send to tokenToXtz to get the xtzOut amount.
 */
export function tokenToXtzTokenInput(xtzOut: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the exchange rate for a token to XTZ trade including the 0.3% fee given
 * to the liquidity providers and the penalty for large trades.
 *
 * @param {(bigInt|number|string)} tokenIn - Token amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function tokenToXtzExchangeRate(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Same as tokenToXtzExchangeRate but adjusted for the decimal places.
 *
 * @param {(bigInt|number|string)} tokenIn - Token amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function tokenToXtzExchangeRateForDisplay(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: any): (number | null);
/**
 * Calculate the tokenToXtz market rate for a given Dexter contract. The market
 * rate is an ideal number that doesn't include fees or penalties. In practice,
 * this rate cannot be executed. This is used for displaying an exchange rate
 * without the trade size penalty (before a user enters an amount for display).
 *
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals a token has. Must be greater than or equal to zero.
 * @returns {(number|null)} The market rate as a float value.
 */
export function tokenToXtzMarketRate(xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the tokenToXtz price impact for a give Dexter contract. Price
 * impact is a measure of how much a trade will alter the future price.
 *
 * @param {(bigInt|number|string)} tokenIn - The amount of Token the sender will sell to Dexter in tokenToXtz.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(number|null)} - The price impact percentage as a float value.
 */
export function tokenToXtzPriceImpact(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the minimum token out to be sent to dexter for a given max xtzOut
 * and the max allowed slippage rate the user accepts.  If the exchange rate
 * has lowered less than the user's allowed slippage at the time of execution,
 * then the trade will fail.
 *
 * @param {(bigInt|number|string)} xtzOut - XTZ out as calculated by tokenToXtzTokenOut. Must be greater than zero.
 * @param {number} allowedSlippage - Maximum slippage rate that a user will except for an exchange. Must be between 0.00 and 1.00.
 * @returns {(bigInt|null)} The minimum token amount to send to the tokenToXtz entrypoint.
 */
export function tokenToXtzMinimumXtzOutput(xtzOut: (bigInt.BigIntegerStatic | number | string), allowedSlippage: number): (bigInt.BigIntegerStatic | null);
/**
 * =============================================================================
 * tokenToToken entrypoint functions
 * =============================================================================
 */
/**
 * The tokenToToken entyrpoint requires two dexter contracts. The documentation
 * refers to the input token as token X and the output token as token Y.
 */
/**
 * Calculate the amount of token Y sold for token X input and the pool state of Dexter
 * for the dexter tokenToToken entrypoint.
 *
 * @param {(bigInt|number|string)} tokenIn - Token X amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds  for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @returns {(bigInt|null)} The amount of token Y that Dexter will send to the :to address in the dexter xtzToToken entrypoint.
 */
export function tokenToTokenTokenOutput(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the amount of token X you must pay in in order to receive a target
 * amount of token Y for a given Dexter pool state. tokenOut is considered the
 * maximum amount a user may receive.
 *
 * @param {(bigInt|number|string)} tokenOut - The amount of token Y that a user wants to receive. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals token X has. Must be greater than or equal to zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals2 - The number of decimals token Y has. Must be greater than or equal to zero.
 * @returns {(bigInt|null)} The amount of token X the user must send to tokenToToken to get the tokenOut amount.
 */
export function tokenToTokenTokenInput(tokenOut: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string), decimals2: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the exchange rate for a token to token trade including the 0.3% fee given
 * to the liquidity providers and the penalty for large trades.
 *
 * @param {(bigInt|number|string)} tokenIn - Token X amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function tokenToTokenExchangeRate(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Same as tokenToTokenExchangeRate but adjusted for the decimal places.
 *
 * @param {(bigInt|number|string)} tokenIn - Token X amount the sender sells to Dexter. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - The number of decimals token X has. Must be greater than or equal to zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals2 - The number of decimals token Y has. Must be greater than or equal to zero.
 * @returns {(number|null)} The exchange rate as a float number.
 */
export function tokenToTokenExchangeRateForDisplay(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string), decimals2: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the tokenToToken market rate for a given Dexter contract. The market
 * rate is an ideal number that doesn't include fees or penalties. In practice,
 * this rate cannot be executed. This is used for displaying an exchange rate
 * without the trade size penalty (before a user enters an amount for display).
 *
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals - Number of decimals token X has. Must be greater than or equal to zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} decimals2 - Number of decimals token Y has. Must be greater than or equal to zero.
 * @returns {(number|null)} The market rate as a float value.
 */
export function tokenToTokenMarketRate(xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), decimals: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string), decimals2: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the tokenToToken price impact for two Dexter contracts. Price
 * impact is measure of how much a trade will alter the future price.
 *
 * @param {(bigInt|number|string)} tokenIn - The amount of token X the sender will sell to Dexter in tokenToXtz.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds for token X. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool2 - XTZ amount that Dexter holds for token Y. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool2 - Token amount that Dexter holds for token Y. Must be greater than zero.
 * @returns {(number|null)} - The price impact percentage as a float value.
 */
export function tokenToTokenPriceImpact(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string), xtzPool2: (bigInt.BigIntegerStatic | number | string), tokenPool2: (bigInt.BigIntegerStatic | number | string)): (number | null);
/**
 * Calculate the minimum token out to be sent to dexter for a given max tokenOut
 * and the max allowed slippage rate the user accepts. If the exchange rate
 * has lowered less than the user's allowed slippage at the time of execution,
 * then the trade will fail.
 *
 * @param {(bigInt|number|string)} tokenOut - Token out as calculated by xtzToTokenTokenOut. Must be greater than zero.
 * @param {number} allowedSlippage - Maximum slippage rate that a user will except for an exchange. Must be between 0.00 and 1.00.
 * @returns {(bigInt|null)} The minimum token amount to send to the tokenToToken entrypoint.
 */
export function tokenToTokenMinimumTokenOutput(tokenOut: (bigInt.BigIntegerStatic | number | string), allowedSlippage: number): (bigInt.BigIntegerStatic | null);
/**
 * =============================================================================
 * addLiquidity entrypoint functions
 * =============================================================================
 */
/**
 * Get the amount of liquidity created and rewarded given an XTZ input,
 * the current liquidity in Dexter and the amount of XTZ held by Dexter.
 * Note that the token amount does not affect the liquidity.
 *
 * @param {(bigInt|number|string)} xtzIn - XTZ amount the sender gives to Dexter for liquidity. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds.  Must be greater than zero.
 * @param {(bigInt|number|string)} totalLiquidity - Total amount of liquidity in a Dexter pool. Must be greater than or equal to zero.
 * @returns {(bigInt|null)} The amount of liquidity that the sender gains.
 */
export function addLiquidityLiquidityCreated(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), totalLiquidity: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * For a given amount of xtzIn and the state of the Dexter xtz pool and token
 * pool. Calculate the minimum amount of tokens the user would be required
 * to deposit. If totalLiquidity is zero then sender must deposit at least one
 * XTZ (1,000,000 mutez) and one token. The exchange rate is not set.
 *
 * @param {(bigInt|number|string)} xtzIn - XTZ amount the sender gives to Dexter for liquidity. Must be greater than zero.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds. Must be greater than zero.
 * @param {(bigInt|number|string)} tokenPool - Token amount that Dexter holds. Must be greater than zero.
 * @returns {(bigInt|null)} The amount of liquidity that the sender gains.
 */
export function addLiquidityTokenIn(xtzIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * For a given amount of tokenIn and the state of the Dexter xtz pool and token
 * pool. Calculate the minimum amount of XTZ the user would be required
 * to deposit. If totalLiquidity is zero then sender must deposit at least one
 * XTZ (1,000,000 mutez) and one token. The exchange rate is not set.
 *
 * @param {(bigInt|number|string)} tokenIn - Token amount the sender gives to Dexter for liquidity.
 * @param {(bigInt|number|string)} xtzPool - XTZ amount that Dexter holds.
 * @param {(bigInt|number|string)} tokenPool Token amount that Dexter holds.
 * @returns {{bigInt|null}} The amount of liquidity that the sender gains.
 */
export function addLiquidityXtzIn(tokenIn: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): {};
/**
 * =============================================================================
 * removeLiquidity entrypoint functions
 * =============================================================================
 */
/**
 * Calculate the amount of token a sender would receive for burning a certain amount
 * of liquidity given a Dexter exchange that has a certain amount of
 * total liquidity and holds an amount of token.
 *
 * @param {(bigInt|number|string)} liquidityBurned LQT that the sender burns.
 * @param {(bigInt|number|string)} totalLiquidity The total amount of liquidity in a Dexter exchange.
 * @param {(bigInt|number|string)} tokenPool amount of token that Dexter holds.
 * @returns {(bigInt|null)} The amount of token that the sender gains.
 */
export function removeLiquidityTokenOut(liquidityBurned: (bigInt.BigIntegerStatic | number | string), totalLiquidity: (bigInt.BigIntegerStatic | number | string), tokenPool: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
/**
 * Calculate the amount of XTZ a sender would receive for burning a certain amount
 * of liquidity given a Dexter exchange that has a certain amount of
 * total liquidity and holds an amount of XTZ.
 *
 * @param {(bigInt|number|string)} liquidityBurned LQT that the sender burns.
 * @param {(bigInt|number|string)} totalLiquidity The total amount of liquidity in a Dexter exchange.
 * @param {(bigInt|number|string)} xtzPool amount of token that Dexter holds.
 * @returns {(bigInt|null)} The amount of XTZ that the sender gains.
 */
export function removeLiquidityXtzOut(liquidityBurned: (bigInt.BigIntegerStatic | number | string), totalLiquidity: (bigInt.BigIntegerStatic | number | string), xtzPool: (bigInt.BigIntegerStatic | number | string)): (bigInt.BigIntegerStatic | null);
import bigInt = require("big-integer");
