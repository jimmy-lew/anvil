import { logger } from '../src/index'

const now = Date.now()
logger.info(undefined)
logger.info(null)
logger.info(0)
logger.info(true)
logger.info(new (class Test { })())

setTimeout(() => {
  logger.fatal({ id: 123, author_id: '123', time: now })
}, 1000)

logger.info({ test: 'i' }, 'test')
logger.info({ test: 'i' })
logger.info('test')
