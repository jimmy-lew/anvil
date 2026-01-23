import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LineBuffer } from '../../src/utils/streamUtils'

describe('LineBuffer', () => {
  let lineBuffer: LineBuffer
  let onLineCallback: any

  beforeEach(() => {
    lineBuffer = new LineBuffer()
    onLineCallback = vi.fn()
  })

  describe('process', () => {
    it('should process LF line endings', () => {
      const chunk = Buffer.from('line1\nline2\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(2)
      expect(onLineCallback).toHaveBeenNthCalledWith(1, Buffer.from('line1'))
      expect(onLineCallback).toHaveBeenNthCalledWith(2, Buffer.from('line2'))
    })

    it('should process CRLF line endings', () => {
      const chunk = Buffer.from('line1\r\nline2\r\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(2)
      expect(onLineCallback).toHaveBeenNthCalledWith(1, Buffer.from('line1'))
      expect(onLineCallback).toHaveBeenNthCalledWith(2, Buffer.from('line2'))
    })

    it('should handle mixed line endings', () => {
      const chunk = Buffer.from('line1\nline2\r\nline3\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(3)
      expect(onLineCallback).toHaveBeenNthCalledWith(1, Buffer.from('line1'))
      expect(onLineCallback).toHaveBeenNthCalledWith(2, Buffer.from('line2'))
      expect(onLineCallback).toHaveBeenNthCalledWith(3, Buffer.from('line3'))
    })

    it('should buffer incomplete lines', () => {
      const chunk1 = Buffer.from('incomplete')
      lineBuffer.process(chunk1, onLineCallback)

      expect(onLineCallback).not.toHaveBeenCalled()

      const chunk2 = Buffer.from(' line\n')
      lineBuffer.process(chunk2, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('incomplete line'))
    })

    it('should handle empty lines', () => {
      const chunk = Buffer.from('\n\nline\n\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('line'))
    })

    it('should handle multiple chunks', () => {
      lineBuffer.process(Buffer.from('line1'), onLineCallback)
      lineBuffer.process(Buffer.from('\nline2\n'), onLineCallback)
      lineBuffer.process(Buffer.from('line3\n'), onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(3)
      expect(onLineCallback).toHaveBeenNthCalledWith(1, Buffer.from('line1'))
      expect(onLineCallback).toHaveBeenNthCalledWith(2, Buffer.from('line2'))
      expect(onLineCallback).toHaveBeenNthCalledWith(3, Buffer.from('line3'))
    })

    it('should handle CRLF split across chunks', () => {
      lineBuffer.process(Buffer.from('line1\r'), onLineCallback)
      lineBuffer.process(Buffer.from('\nline2'), onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('line1'))
    })

    it('should handle multiple newlines in one chunk', () => {
      const chunk = Buffer.from('line1\nline2\nline3\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(3)
      expect(onLineCallback).toHaveBeenNthCalledWith(1, Buffer.from('line1'))
      expect(onLineCallback).toHaveBeenNthCalledWith(2, Buffer.from('line2'))
      expect(onLineCallback).toHaveBeenNthCalledWith(3, Buffer.from('line3'))
    })
  })

  describe('flush', () => {
    it('should flush remaining buffer data', () => {
      lineBuffer.process(Buffer.from('remaining'), onLineCallback)
      lineBuffer.flush(onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('remaining'))
    })

    it('should not call callback when buffer is empty', () => {
      lineBuffer.flush(onLineCallback)
      expect(onLineCallback).not.toHaveBeenCalled()
    })

    it('should clear buffer after flush', () => {
      lineBuffer.process(Buffer.from('data'), onLineCallback)
      lineBuffer.flush(onLineCallback)

      // Should not call callback again
      lineBuffer.flush(onLineCallback)
      expect(onLineCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('clear', () => {
    it('should clear the buffer', () => {
      lineBuffer.process(Buffer.from('data'), onLineCallback)
      lineBuffer.clear()

      lineBuffer.flush(onLineCallback)
      expect(onLineCallback).not.toHaveBeenCalled()
    })

    it('should allow new data after clear', () => {
      lineBuffer.process(Buffer.from('old'), onLineCallback)
      lineBuffer.clear()
      lineBuffer.process(Buffer.from('new\n'), onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('new'))
    })
  })

  describe('edge cases', () => {
    it('should handle empty chunks', () => {
      lineBuffer.process(Buffer.alloc(0), onLineCallback)
      expect(onLineCallback).not.toHaveBeenCalled()
    })

    it('should handle chunks with only newlines', () => {
      lineBuffer.process(Buffer.from('\n\n\n'), onLineCallback)
      expect(onLineCallback).not.toHaveBeenCalled()
    })

    it('should handle null bytes in line content', () => {
      const chunk = Buffer.from('line\x00with\x00null\n')
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from('line\x00with\x00null'))
    })

    it('should handle very long lines', () => {
      const longLine = 'x'.repeat(10000)
      const chunk = Buffer.from(`${longLine}\n`)
      lineBuffer.process(chunk, onLineCallback)

      expect(onLineCallback).toHaveBeenCalledTimes(1)
      expect(onLineCallback).toHaveBeenCalledWith(Buffer.from(longLine))
    })
  })
})