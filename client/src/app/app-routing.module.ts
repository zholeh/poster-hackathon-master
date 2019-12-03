import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CardsComponent } from "./cards.component";
import { MapsComponent } from "./maps.component";

const routes: Routes = [
  { path: ":code", component: CardsComponent },
  { path: ":code/map", component: MapsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
