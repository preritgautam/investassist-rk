import { AbstractMiddleware } from '../../framework/plugins/WebPlugin';
import { injectable } from '../boot';
import * as multer from 'multer';

const upload = multer({ dest: 'fileUploads/' });

@injectable()
export class UploadModelFileMiddleware extends AbstractMiddleware {
  middleware = upload.single('modelFile');
}
