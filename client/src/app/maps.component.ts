import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { interval } from "rxjs";
import { Subject } from "rxjs";
import { debounce } from "rxjs/operators";

interface ICard {
  match: IMatch;
  ingredient: IIngredient;
}

interface IMatch {
  label: string;
  proteins: string;
  fats: string;
  carbohydrates: string;
  kcal: string;
}

interface IIngredient {
  ingredient_id: number;
  ingredient_name: string;
  extras: any;
}

interface IMapping {
  mappings: ICard[];
}

@Component({
  selector: "app-map",
  templateUrl: "./maps.component.html",
  styleUrls: ["./maps.component.scss"]
})
export class MapsComponent implements OnInit {
  public cards: ICard[];
  private base;
  private keyup = new Subject<string>(); //Subscription.fromEvent(document, 'keyup');
  private result$ = this.keyup.pipe(debounce(() => interval(300)));
  public typeAhead: any[] = [];

  public filterBZHUProduct = "";
  public filterProduct = "";

  constructor(private http: HttpClient) {}

  keyUp(value) {
    this.keyup.next(value);
  }

  async ngOnInit() {
    this.base = window.location.href.match(/https?:\/\/[^\/]*/)[0];
    this.cards = ((await this.http
      .get(this.base + "/ingredients/")
      .toPromise()) as IMapping).mappings as Array<ICard>;
    this.result$.subscribe(async x => {
      const typeAhead = (await this.http
        .get(this.base + "/mapping/single?str=" + x)
        .toPromise()) as any[];

      this.typeAhead = [...typeAhead];
      console.log(typeAhead);
    });
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  public handleStaticResultSelected(event) {
    console.log(event);
  }

  onPhrase(phrase: boolean) {}

  async onButtonClick(e) {
    const ingredients = this.cards.map(({ ingredient, match }) => {
      const { ingredient_id, extras } = ingredient;
      const { carbs, fats, proteins, label, kcal } = extras;

      return { ingredient_id, carbs, fats, proteins, label, kcal };
    });

    await this.http
      .post("/ingredients/extras", {
        ingredients
      })
      .toPromise();
  }
}
