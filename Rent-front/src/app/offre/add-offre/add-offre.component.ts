import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

import { OffreService } from '../offre.service';
import { HouseService } from '../../house/house.service';

interface House {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-add-offre',
  templateUrl: './add-offre.component.html',
})
export class AddOffreComponent implements OnInit {
  offreService: any;
  houseData: any;
  form: any;
onHouseSelect($event: Event) {
throw new Error('Method not implemented.');
}
  offreForm!: FormGroup;
  houses: House[] = [];
  selectedHousePrice: number = 0;
  houseId: number | null = null;


  constructor(private fb: FormBuilder, private http: HttpClient,offreService:OffreService ,private router: Router, private houseService: HouseService,private route: ActivatedRoute) {}

  ngOnInit(): void {
    const now = new Date(); // Récupérer la date et l'heure actuelles
  const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    this.offreForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      houseId: [''],
      publicationDate: [formattedDate], // Initialisation auto
    publicationTime: [formattedTime], // Initialisation auto
      location: ['', Validators.required],
      type:['', Validators.required],
      availability: ['', Validators.required],
      priceTTC: ['' ]
    });

    this.route.queryParams.subscribe(params => {
      this.houseId = params['houseId'];
      if (this.houseId) {
        this.loadHouseData(this.houseId);
      }
    });
  }

  // Charger la liste des maisons
  loadHouseData(houseId: number) {
    this.houseService.getHouseById(houseId).subscribe(house => {
      console.log("Données maison récupérées:", house);

      this.houseData = house;
      this.offreForm.patchValue({
        title: house.title,
        description: house.description,
        priceTTC: house.priceTTC,
        type: house.type,
        location: house.location
      });
    });
  }

 

  // Envoi du formulaire
  submitForm() {
    // Vérification des champs obligatoires avant soumission
    if (this.offreForm.invalid) {
      // Affichage d'un message d'erreur avec SweetAlert2
      Swal.fire({
        title: 'Erreur !',
        text: 'Veuillez remplir tous les champs obligatoires.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return; // Ne pas soumettre si le formulaire est invalide
    }
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
  

    const offreData = {
      title: this.offreForm.value.title,
      description: this.offreForm.value.description,
      houseId: Number(this.offreForm.value.houseId),
      availability: this.offreForm.value.availability,
      publicationDate: formattedDate, // Ajout de la date actuelle
      publicationTime: formattedTime, // Ajout de l'heure actuelle
      location:this.offreForm.value.location,
      priceTTC: this.offreForm.value.priceTTC
    };

    this.offreService. addOffre(offreData).subscribe(
      (response: any) => {
        console.log('offre ajouté avec succès', response);

        // Affichage du message de succès avec SweetAlert2
        Swal.fire({
          title: 'Succès !',
          text: 'L\'offre a été ajoutée avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigate(['/list-offre']); // Remplacez '/offres' par le chemin réel de votre liste des offres

          // Optionnel : Vous pouvez rediriger l'utilisateur vers une autre page après succès
          // this.router.navigate(['/offre']); 
        });
      },
      (error: any) => {
        console.error('Erreur lors de l\'ajout', error);
        // Affichage du message d'erreur avec SweetAlert2
        Swal.fire({
          title: 'Erreur !',
          text: 'Une erreur est survenue lors de l\'ajout de l\'offre.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}
