import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  public title = "БЖУ калькулюятор";
  public status: 0 | 1 = 0;
  public description: string = "Калькулятор: Белки, жиры, углеводы";

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(
      event => event instanceof NavigationEnd && this.handleRouteChange()
    );
  }

  private changeStatus(newStatus) {
    this.status = newStatus;
    switch (this.status) {
      case 0:
        this.description = "Калькулятор: Белки, жиры, углеводы";
        break;
      case 1:
        this.description = "Справочник: Белки, жиры, углеводы";
        break;

      default:
        this.description = "Калькулятор: Белки, жиры, углеводы";
    }
  }

  handleRouteChange = () => {
    if (/\/map$/i.test(this.router.url)) {
      this.changeStatus(1);
    }
  };

  btnClick() {
    this.router.navigateByUrl("/las/map");
    this.changeStatus(1);
  }
  btnBZHUClick() {
    this.router.navigateByUrl("/las");
    this.changeStatus(0);
  }
}
