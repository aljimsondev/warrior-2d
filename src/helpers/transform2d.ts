/**
 * Transform map array into a 2d array
 * @param mapArray - the map array
 * @param column -row length
 * @returns
 */
export const transform2d = (mapArray: number[], column: number) => {
  const map2d: number[][] = [];

  for (let i = 0; i < mapArray.length; i += column) {
    const row = mapArray.slice(i, i + column);

    map2d.push(row);
  }

  return map2d;
};
