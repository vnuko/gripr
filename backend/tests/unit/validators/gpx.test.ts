import { describe, it, expect } from 'vitest';
import { validateGpxFile } from '../../../src/validators/gpx.validator.js';
import { UPLOAD_CONFIG } from '../../../src/utils/constants.js';

function createMockFile(
  content: string,
  filename: string = 'test.gpx',
  size?: number
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'application/gpx+xml',
    size: size ?? Buffer.byteLength(content, 'utf-8'),
    buffer: Buffer.from(content, 'utf-8'),
    destination: '',
    filename: '',
    path: '',
    stream: {} as never,
  };
}

describe('GPX Validator', () => {
  describe('validateGpxFile', () => {
    it('should accept valid GPX file', () => {
      const validGpx = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk><trkseg><trkpt lat="47.0" lon="8.0"><ele>450</ele></trkpt></trkseg></trk>
        </gpx>`;

      const file = createMockFile(validGpx);
      const result = validateGpxFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject missing file', () => {
      const result = validateGpxFile(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No GPX file provided');
    });

    it('should reject file that is too large', () => {
      const validGpx = '<?xml version="1.0"?><gpx></gpx>';
      const file = createMockFile(validGpx, 'test.gpx', UPLOAD_CONFIG.MAX_FILE_SIZE + 1);

      const result = validateGpxFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum');
    });

    it('should reject non-GPX extension', () => {
      const content = '<?xml version="1.0"?><gpx></gpx>';
      const file = createMockFile(content, 'test.txt');

      const result = validateGpxFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File must be a .gpx file');
    });

    it('should reject invalid GPX content', () => {
      const file = createMockFile('not valid gpx content');

      const result = validateGpxFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid GPX file format');
    });
  });
});