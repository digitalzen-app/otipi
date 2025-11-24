<template>
  <IonPage>
    <ion-content>
      <ion-grid>
        <ion-row>
          <ion-col class="ion-hide-sm-down"></ion-col>
          <ion-col>
            <h1>404 - page not found</h1>
            <p>
              <IonButton :routerLink="{ name: `home` }"
                >Quick, go back home...</IonButton
              >
            </p>
          </ion-col>
          <ion-col class="ion-hide-sm-down"> </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </IonPage>
</template>

<script>
import {
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonFooter,
  IonText,
  IonButton,
} from "@ionic/vue";
import { defineComponent } from "vue";
export default defineComponent({
  name: "NotFound404Page",
  components: {
    IonPage,
    IonGrid,
    IonRow,
    IonCol,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonFooter,
    IonText,
    IonButton,
  },
});
</script>
