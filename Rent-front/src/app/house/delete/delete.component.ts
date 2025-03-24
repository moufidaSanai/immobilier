import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HouseService } from '../house.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent {
  @Input('selectedList') selectedList: any[] = [];
        
          @Output()
          close= new EventEmitter<boolean>()
          @Output()
          save= new EventEmitter<boolean>()
          constructor(private HouseService:HouseService){
        
          }
          closedEvent()
          {
            this.close.emit(true)
          }
          deletelist() {
  if (this.selectedList.length === 0) {
    console.warn("Aucun immobilier sélectionné !");
    return;
  }

  const houseIds = this.selectedList.map(equipement => equipement.id);
  console.log("Imobiliers sélectionnés :", houseIds);

  this.HouseService.deleteMultiple(houseIds).subscribe(
    (data: any) => {
      console.log('Suppression réussie',houseIds);
      this.save.emit(true);
    },
    (error) => {
      console.error('Échec de la suppression', error);
    }
  );
}


}
