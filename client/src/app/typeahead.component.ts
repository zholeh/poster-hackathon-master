import {
  Component,
  OnInit,
  Input,
  HostListener,
  Output,
  EventEmitter
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { interval } from "rxjs";
import { Subject } from "rxjs";
import { debounce } from "rxjs/operators";

@Component({
  selector: "typeahead",
  templateUrl: "./typeahead.component.html",
  styleUrls: ["./typeahead.component.scss"]
})
export class TypeaheadComponent implements OnInit {
  private keyup = new Subject<string>(); //Subscription.fromEvent(document, 'keyup');
  private result$ = this.keyup.pipe(debounce(() => interval(300)));
  public opened = false;
  public typeAhead: any[] = [];

  @Input() public card: any;
  @Output() public phrase = new EventEmitter<string>();

  constructor(private http: HttpClient) {}

  keyUp(value) {
    this.keyup.next(value);
  }

  async ngOnInit() {
    this.result$.subscribe(async x => {
      const typeAhead = (await this.http
        .get("/mapping/single?str=" + x)
        .toPromise()) as any[];
      this.typeAhead = [...typeAhead];
      this.opened = true;
    });
  }

  selectElement(suggestion: any) {
    console.log(suggestion);
    this.phrase.emit(suggestion);
    console.log(suggestion);
    const {proteins, carbohydrates: carbs , fats, label, kcal} = suggestion;
    this.card.ingredient.extras = {
      label,
      proteins,
      carbs,
      fats,
      kcal,
    };
    this.opened = false;
  }

  @HostListener("window:click", ["$event"])
  public handleClick(e: MouseEvent): void {
    const isInCart: Element | null = (e.target as HTMLElement).closest(
      ".options"
    );
    if (isInCart) {
      return;
    }
    this.opened = false;
  }

  trackByLabel(index: number, item: any) {
    return item.label;
  }
}
