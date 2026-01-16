import { logger } from '../logger'

export type StructurePredicate<T> = (structure: unknown) => structure is T

async function loadStruct<T extends ObjectConstructor>(
  path: string,
  import_func: () => Promise<T>,
  predicate: StructurePredicate<T>,
  ignore_list: string[],
): Promise<Nullable<T>> {
  const [name] = path.split('/').slice(-1)
  if (['index.ts', ...ignore_list].includes(name))
    return null

  logger.debug(`Importing ${path}...`)
  try {
    const struct = await import_func() as T
    if (struct === undefined)
      throw new Error('No member exported')
    logger.debug(`Imported ${struct.name} successfully`)

    return predicate(struct) ? struct : null
  }
  catch (error) {
    if (error.message === 'No member exported') {
      logger.warn(error)
    }
    else {
      logger.error(error, `Failed to import ${path}: ${error}`)
    }
  }

  return null
}

export async function loadStructures<T>(
  structs: Record<string, () => Promise<ObjectConstructor>>,
  pred: StructurePredicate<T>,
  ignore_list = [],
): Promise<T[]> {
  const structures = (await Promise.all(Object.entries(structs).map(
    (val) => loadStruct(...val, pred, ignore_list)
  ))).filter(val => val).map(val => new val()) as T[]
  return structures
}
