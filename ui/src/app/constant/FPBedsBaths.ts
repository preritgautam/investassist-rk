import { FloorPlan } from '../../types';

export function getFpFloorPlan(fp: string): FloorPlan {
  for (let i = 0; i < fpConfigExtractor.length; i++) {
    const [regEx, extractor] = fpConfigExtractor[i];
    const floorPlan = extractor(regEx, fp);
    if (floorPlan) {
      if (floorPlan.baths) {
        const intBaths = parseInt(floorPlan.baths);
        if (intBaths > 9) {
          floorPlan.baths = (intBaths / 10).toString();
        }
      }
      return floorPlan;
    }
  }
  return null;
}


function floorPlanExtractorBedAndBath(regex: RegExp, text: string): FloorPlan {
  const match = regex.exec(text);
  if (match) {
    const baths = (match[2] !== undefined) ? parseFloat(match[2]).toString() : '1';
    const beds = match[1] === '0' ? 'studio' : match[1];

    return { beds, baths, tenantType: '', renameFloorPlan: '' };
  }
  return null;
}

function floorPlanExtractorStudio(regex: RegExp, text: string): FloorPlan {
  const match = regex.exec(text);
  if (match) {
    return {
      beds: 'studio', baths: '', tenantType: '', renameFloorPlan: '',
    };
  }
  return null;
}

function floorPlanExtractorConstants(beds: string, baths: string) {
  return function(regex: RegExp, text: string): FloorPlan {
    const match = regex.exec(text);
    if (match) {
      return { beds, baths, renameFloorPlan: '', tenantType: '' };
    }
    return null;
  };
}

const fpConfigExtractor: [RegExp, (regex: RegExp, text: string) => FloorPlan][] = [
  // IMPORTANT!!!
  // ORDER MATTERS!!!
  // WHILE MAKING ANY CHANGE BELOW TRY USING THE test.tsx.dummy page to test
  [new RegExp(/g21(\d)x(\d\d?)[a-z]*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/g21stu.*/i), floorPlanExtractorStudio],
  [new RegExp(/f50(\d)x(\d\d?)[a-z]*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/f50stu.*/i), floorPlanExtractorStudio],
  [new RegExp(/f50den.*/i), floorPlanExtractorStudio],
  [new RegExp(/(\d)X(\d\.?\d?).*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)(\d)G.*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d).*BD.*(\d).*B(th)/i), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)bed\/(\d)bath/), floorPlanExtractorBedAndBath],
  [new RegExp(/single/), floorPlanExtractorConstants('1', '1')],
  [new RegExp(/double/), floorPlanExtractorConstants('2', '1')],
  [new RegExp(/triple/), floorPlanExtractorConstants('3', '2')],
  [new RegExp(/.*(studio|stdio|EFF|stu|^su).*/i), floorPlanExtractorStudio],
  [new RegExp(/(\d)b(\d)b/i), floorPlanExtractorBedAndBath],
  [new RegExp(/.*(\d)(?:BR|D).?(\d)(B|D).*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)BX?(\d\.?\d?)B.*/i), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)\/(\d\.\d\d).*/), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)\/(\d\.?\d?).*/), floorPlanExtractorBedAndBath],
  [new RegExp(/(\d)(\d)?[A-Z][A-Z]/i), floorPlanExtractorBedAndBath],
  [new RegExp(/^1U.*/), floorPlanExtractorConstants('1', '1')],
  [new RegExp(/[^0-9]*(\d)[.*-](\d)[^0-9]*/), floorPlanExtractorBedAndBath],
];
