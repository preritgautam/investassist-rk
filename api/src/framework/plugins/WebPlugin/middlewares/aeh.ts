import { NextFunction, Request, Response } from 'express';

// TODO:  this should be smarter e.g. use server debug flag to
//        return the error stack or not
function aeh(amw): (Request, Response, NextFUnction?) => Promise<any> {
  return async function(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return await amw(req, res, next);
    } catch (e) {
      console.log('Oops! There was an error: ', e.toString());
      console.log(e.stack);
      res.status(500).json({
        status: 'error',
        error: e.toString(),
        message: 'Oops! something went wrong.',
      });
    }
  };
}

export { aeh };
