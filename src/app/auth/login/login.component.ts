import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule],
})
export class LoginComponent {
  private form = viewChild.required<NgForm>('form');
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const savedForm = window.localStorage.getItem('saved-login-form');

      if (savedForm) {
        const loadedFormData = JSON.parse(savedForm);
        const savedEmail = loadedFormData.email;

        /* (1) */
        setTimeout(() => {
          this.form().controls['email'].setValue(savedEmail);
        }, 1);
      }

      const subscription = this.form()
        .valueChanges?.pipe(debounceTime(500))
        .subscribe({
          next: (values) =>
            window.localStorage.setItem(
              'saved-login-form',
              JSON.stringify({ email: values.email })
            ),
        });

      this.destroyRef.onDestroy(() => subscription?.unsubscribe());
    });
  }

  onSubmit(formData: NgForm) {
    if (formData.form.invalid) {
      return;
    }

    const enteredEmail = formData.form.value.email;
    const enteredPassword = formData.form.value.password;

    console.log(enteredEmail, enteredPassword);

    formData.form.reset();
  }
}

/*
(1) Template has been rendered and the form object is initialized, but the control objects aren't fully initialized yet.
Using setTimeout to wait for the one update tick. We'll use more elegant solution with reactive forms
*/
