export const asyncForEach = async <T>(array: Array<T>, callback: (item: T, index: number) => Promise<any>) => {
    for (let index = 0; index < array.length; index += 1) {
      await callback(array[index], index)
    }
  }