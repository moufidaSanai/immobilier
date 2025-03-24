import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HouseService } from '../house.service';
import { Router } from '@angular/router';
import { CaracteristiqueService } from '../../caracteristique/caracteristique.service';
import { EquipementService } from '../../equipement/equipement.service';
import { Picture } from '../house';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  arrayDetails: any=[];
deletePicAction(_t123: Picture) {
throw new Error('Method not implemented.');
}
  houseForm: FormGroup;
  characteristics: any[] = [];
  equipements: any[] = [];
  pictureArray: Picture[] = [];
  arrayCharacteristics: { id: number; quantite: number }[] = [];
  arrayEquipements: { id: number; quantite: number }[] = [];
  houseId!: number;
  tva: number = 0;
 quantityCharat:number=0
  constructor(
    private fb: FormBuilder,
    private houseService: HouseService,
    private router: Router,
    private characteristicService: CaracteristiqueService,
    private equipementService: EquipementService
  ) {
    this.houseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      city: ['', Validators.required],
      location: ['', Validators.required],
      poste_code: ['', [Validators.required, Validators.pattern('^[0-9]{4,5}$')]],
      priceHT: [0, Validators.required],
      tva: [this.tva, Validators.required],
      priceTTC: [{ value: 0, disabled: true }],
      type: ['', Validators.required],
      housedetails: [],
      pictures: [],
      lessorId:[],
      active:[true]
    });
  }

  ngOnInit(): void {
    this.getAllCharacteristics();
    this.loadEquipements();
    
  }

  getAllCharacteristics(): void {
    this.characteristicService.getCharacteristics().subscribe({
      next: (data) => {
        this.characteristics = data.map(char => ({ ...char, quantite: 0 }));
      },
      error: (err) => console.error('Erreur chargement caractéristiques:', err)
    });
  }

  loadEquipements(): void {
    this.equipementService.getEquipements().subscribe({
      next: (data) => {
        this.equipements = data.map(equip => ({ ...equip, quantite: 0 }));
      },
      error: (err) => console.error('Erreur chargement équipements:', err)
    });
  }

  onSelectCharacteristic(event: Event, characteristic: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.arrayDetails.push({ characteristicId: characteristic.id, quantite: characteristic.quantite  });
    } else {
      this.arrayDetails = this.arrayDetails.filter((c:any) => c.characteristicId !== characteristic.id);
    }
    console.log("house details",this.arrayDetails)
  }

  onSelectEquipement(event: Event, equipment: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.arrayDetails.push({ equipementId: equipment.id, quantite: equipment.quantite || 1 });
    } else {
      this.arrayDetails = this.arrayDetails.filter((e:any) => e.equipementId !== equipment.id);
    }
  }

  onQuantityChange(type: string, id: number, event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;

    if (type === 'characteristic') {
      const item = this.arrayDetails.find((c:any) => c.characteristicId === id);
      if (item) item.quantite = value;
    } else if (type === 'equipement') {
      const item = this.arrayDetails.find((e:any) => e.equipementId === id);
      if (item) item.quantite = value;
    }
  }

  picked(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > 100000) {
          alert('File size exceeds 100KB');
          return;
        }
        this.handleInputChange(file);
      }
    }
  }
   // Calculer le prix TTC
    calculateTTC() {
      const priceHT = this.houseForm.get('priceHT')?.value || 0;
      const tvaValue = this.houseForm.get('tva')?.value || 0;
      
      // Calcul du prix TTC
      const ttc = priceHT * (1 + tvaValue / 100);
      this.houseForm.patchValue({
        priceTTC: ttc.toFixed(2)
      });
    }

  handleInputChange(file: File): void {
    const pattern = /image-*/;
    const reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('Invalid image format');
      return;
    }
    reader.onloadend = (e: any) => {
      const picture: Picture = {
        url: e.target.result,
        defaults: this.pictureArray.length === 0
      };
      this.pictureArray.push(picture);
    };
    reader.readAsDataURL(file);
  }
  getCookie(cname: string) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  onSubmit(): void {
    if (this.houseForm.invalid) {
      Swal.fire({ icon: 'warning', title: 'Avertissement!', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    if (this.arrayDetails.length === 0 ) {
      Swal.fire({ icon: 'warning', title: 'Avertissement!', text: 'Sélectionnez au moins une caractéristique et un équipement.' });
      return;
    }

    this.houseForm.value.housedetails = this.arrayDetails;
    // this.houseForm.value.equipments = this.arrayEquipements;
    this.houseForm.value.pictures = this.pictureArray;
    this.houseForm.value.userId=Number(this.getCookie("id"))

    this.houseService.createHouse(this.houseForm.value).subscribe({
      next: (data) => {

        this.pictureArray.forEach(async picture => {
          picture.HouseId = data.id
          await this.houseService.addPicture(picture)
            .subscribe(
              picture => {
                console.log("picture",picture)
              //  console.log("data",data)
              })
            })

        Swal.fire({ icon: 'success', title: 'Succès!', text: 'Immobilier ajouté avec succès!' }).then(() => {
          this.router.navigate(['/house']);
        });
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Une erreur est survenue lors de l\'ajout d\'immobilier!' });
      }
    });
  }
}
