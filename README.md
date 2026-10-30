# Maquette App Argentine (Roomz)

Maquette cliquable de l’app Roomz pour les petits hôtels d’Argentine : les
conversations WhatsApp d’un hôtel, gérées par un agent qui répond et réserve.
**Front uniquement** : toutes les données sont fictives et rien n’est enregistré
(recharger remet la démo à zéro).

## La voir

```bash
npm install
npx expo start
```

- **Sur téléphone** : installer l’app Expo Go, puis scanner le QR code affiché
  dans le terminal (téléphone et ordinateur sur le même Wi-Fi).
- **Sur ordinateur** : appuyer sur `w` dans le terminal, l’app s’ouvre dans le
  navigateur, à la taille d’un téléphone.

## Ce qu’il y a dedans

- **Discussions** (écran d’arrivée) : la liste façon WhatsApp, filtres Action
  requise / En cours / Toutes / +, conversations ouvrables, zone « Pour moi »
  (glisser une discussion à gauche), bouton « Reprendre la main ».
- **Calendrier** : façon Google Agenda, le mois en haut, la journée touchée
  dessous, recherche par nom, fiche de chaque réservation.
- **Menu** : tableau de bord, barre pour poser une question à l’assistant
  d’aide, statistiques par mois et par canal.
- **Paramètres** : démarrage rapide pour lancer l’agent, puis configuration
  complète (Mercado Pago, style d’écriture, autres canaux).

Stack : Expo (React Native), Expo Router, TypeScript.
