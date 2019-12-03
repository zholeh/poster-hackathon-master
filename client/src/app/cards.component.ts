import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

export interface Card {
  product_name: string;
  image: string;
  proteins: number;
  fats: number;
  carbs: number;
  kcal: number;
}

@Component({
  selector: "app-cards",
  templateUrl: "./cards.component.html",
  styleUrls: ["./cards.component.scss"]
})
export class CardsComponent implements OnInit {
  constructor(private http: HttpClient, private router: Router) {}
  cards: Array<Card>;
  code: string;

  async ngOnInit() {
    this.code = window.location.href.match(/[^\/]*$/)[0];
    const base = window.location.href.match(/https?:\/\/[^\/]*/)[0];
    this.cards = (await this.http
      .get(base + "/bzhu/" + this.code)
      .toPromise()) as Array<Card>;
    // console.log(resp);
  }
}
