import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EquipementService } from '../equipement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-equipmnt',
  templateUrl: './add-equipemnt.component.html',
  styleUrls: ['./add-equipemnt.component.css'],
})
export class AddEquipemntComponent {
  equipment = {
    title: '',
    description: '',
    icon: null as File | null,
  };

  constructor(
    private router: Router,
    private equipementService: EquipementService
  ) {}

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.equipment.icon = event.target.files[0];
    }
  }

  onSubmit() {
    // Vérification si les champs obligatoires sont remplis
    if (!this.equipment.title || !this.equipment.description || !this.equipment.icon) {
      Swal.fire({
        title: 'Erreur !',
        text: 'Veuillez remplir tous les champs obligatoires.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return; // Stopper l'exécution si les champs ne sont pas remplis
    }

    const formData = new FormData();
    formData.append('title', this.equipment.title);
    formData.append('description', this.equipment.description);
    if (this.equipment.icon) {
      formData.append('image', this.equipment.icon); // 'image' doit correspondre au champ attendu par le backend
    }

    this.equipementService.addEquipement(formData).subscribe(
      (response) => {
        console.log('Équipement ajouté avec succès', response);

        // Afficher une alerte de succès avec SweetAlert2
        Swal.fire({
          title: 'Succès !',
          text: 'L\'équipement a été ajouté avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          // Rediriger vers la liste des équipements après confirmation
          this.router.navigate(['/equipement']);
        });
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de l\'équipement', error);

        // Afficher une alerte d'erreur en cas de problème
        Swal.fire({
          title: 'Erreur !',
          text: 'Une erreur est survenue lors de l\'ajout de l\'équipement.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
}
