const NEWLINE = 0x0a; // '\n'
const CARRIAGE_RETURN = 0x0d; // '\r'

/**
 * Utility class for buffering and splitting newline-delimited data
 * Handles both LF (\n) and CRLF (\r\n) line endings
 */
export class LineBuffer {
  private buffer: Buffer = Buffer.alloc(0);

  /**
   * Process incoming data chunk and invoke callback for each complete line
   */
  process(chunk: Buffer, onLine: (line: Buffer) => void): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    let index: number;
    while ((index = this.buffer.indexOf(NEWLINE)) !== -1) {
      // Handle CRLF by checking if previous byte is CR
      const end = (index > 0 && this.buffer[index - 1] === CARRIAGE_RETURN)
        ? index - 1
        : index;

      const line = this.buffer.subarray(0, end);
      this.buffer = this.buffer.subarray(index + 1);

      if (line.length > 0) {
        onLine(line);
      }
    }
  }

  /**
   * Process any remaining buffered data (called on stream end)
   */
  flush(onLine: (line: Buffer) => void): void {
    if (this.buffer.length > 0) {
      onLine(this.buffer);
      this.buffer = Buffer.alloc(0);
    }
  }

  /**
   * Clear the internal buffer
   */
  clear(): void {
    this.buffer = Buffer.alloc(0);
  }
}
