/**
 * [description]
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 * @example template`Hello ${"foo"}!`({ foo: "World" }) => "Hello World!"
 */
export const template = (
  strings,
  ...keys
): ((dict: Record<string, string>) => string) => {
  return (dict: Record<string, string>) => {
    const result = [strings[0]];
    keys.forEach((key, i) => {
      result.push(dict[key], strings[i + 1]);
    });
    return result.join('');
  };
};
