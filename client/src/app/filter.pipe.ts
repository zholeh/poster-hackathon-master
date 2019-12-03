import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filters"
})
export class FilterPipe implements PipeTransform {
  transform(values: any[], filter: any): any {
    if (!values) {
      return values;
    }
    if (!Array.isArray(filter)) {
      return values;
    }

    let newValues = [...values];
    filter.forEach((elFilter: any) => {
      const fieldFilter = elFilter[0];
      const field = elFilter[1];
      const arr = field.split(".");
      if (fieldFilter) {
        newValues = newValues.filter(el => {
          let elVal = el;
          arr.forEach(elEach => {
            elVal = elVal[elEach];
          });
          const reg = new RegExp(`${fieldFilter}`, "i");
          return reg.test(elVal);
        })
      }
    });

    return newValues;
  }
}
