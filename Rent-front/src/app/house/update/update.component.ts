import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Picture } from '../house';
import { HouseService } from '../house.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CaracteristiqueService } from '../../caracteristique/caracteristique.service';
import { EquipementService } from '../../equipement/equipement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {
deletePicAction(_t113: any) {
throw new Error('Method not implemented.');
}

  houseForm: FormGroup;
  characteristics: any[] = [];
  equipements: any[] = [];
  pictureArray: any[] = [];
  arrayCharacteristics: { id: number; quantite: number }[] = [];
  arrayEquipements: { id: number; quantite: number }[] = [];
  houseId!: number;
  tva: number = 0;


  constructor(
    private fb: FormBuilder,
    private houseService: HouseService,
    private router: Router,
    private route: ActivatedRoute,
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
      priceTTC: [{ value: 0, disabled: true }],      type: ['', Validators.required],
      characteristics: [],
      equipments: [],
      pictures: []
    });
  }

  ngOnInit(): void {
    this.houseId = this.route.snapshot.params['id'];
    this.loadHouseDetails(this.houseId);
    this.getAllCharacteristics();
    this.loadEquipements();
  }

  loadHouseDetails(id: number): void {
    this.houseService.getHouseById(id).subscribe({
      next: (data) => {
        console.log("data",data)
        this.houseForm.patchValue({
          title: data.title,
          description: data.description,
          location: data.location,
          city: data.city,
          poste_code: data.poste_code,
          priceHT: data.priceHT,
          tva: data.tva,
          priceTTC: data.priceTTC,
          type:data.type,
        });

        this.arrayCharacteristics = data.characteristics.map((c: any) => ({
          id: c.id,
          quantite: c.quantite || 1
        }));

        this.arrayEquipements = data.equipments.map((e: any) => ({
          id: e.id,
          quantite: e.quantite || 1
        }));

        this.pictureArray = data.pictures 
      },
      error: (err) => console.error('Erreur chargement immobilier:', err)
    });
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

  getAllCharacteristics(): void {
    this.characteristicService.getCharacteristics().subscribe({
      next: (data) => {
        this.characteristics = data.map(char => ({
          ...char,
          quantite: this.arrayCharacteristics.find(c => c.id === char.id)?.quantite || 0
        }));
      },
      error: (err) => console.error('Erreur chargement caractéristiques:', err)
    });
  }

  loadEquipements(): void {
    this.equipementService.getEquipements().subscribe({
      next: (data) => {
        this.equipements = data.map(equip => ({
          ...equip,
          quantite: this.arrayEquipements.find(e => e.id === equip.id)?.quantite || 0
        }));
      },
      error: (err) => console.error('Erreur chargement équipements:', err)
    });
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

  onSelectCharacteristic(event: Event, characteristic: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.arrayCharacteristics.push({ id: characteristic.id, quantite: characteristic.quantite || 1 });
    } else {
      this.arrayCharacteristics = this.arrayCharacteristics.filter(c => c.id !== characteristic.id);
    }
  }

  onSelectEquipement(event: Event, equipment: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.arrayEquipements.push({ id: equipment.id, quantite: equipment.quantite || 1 });
    } else {
      this.arrayEquipements = this.arrayEquipements.filter(e => e.id !== equipment.id);
    }
  }

  onQuantityChange(type: string, id: number, event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (type === 'characteristic') {
      const item = this.arrayCharacteristics.find(c => c.id === id);
      if (item) item.quantite = value;
    } else if (type === 'equipement') {
      const item = this.arrayEquipements.find(e => e.id === id);
      if (item) item.quantite = value;
    }
  }

  onSubmit(): void {
    this.houseForm.value.characteristics = this.arrayCharacteristics;
    this.houseForm.value.equipments = this.arrayEquipements;
    this.houseForm.value.pictures = this.pictureArray;

    this.houseService.updateHouse(this.houseId, this.houseForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Immobilier modifié avec succès!'
        }).then(() => {
          this.router.navigate(['/house']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la modification!'
        });
      }
    });
  }
}
