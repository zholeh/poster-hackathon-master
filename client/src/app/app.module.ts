import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CardsComponent } from "./cards.component";
import { TypeaheadComponent } from "./typeahead.component";
import { MapsComponent } from "./maps.component";
import { NgxTypeaheadModule } from "ngx-typeahead";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FilterPipe } from './filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CardsComponent,
    TypeaheadComponent,
    MapsComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxTypeaheadModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
