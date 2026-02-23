

## Supprimer le booking test expiré

Le booking HyperGuest `2106998` existe en base avec le statut `PendingReview` mais n'existe plus côté HyperGuest (environnement test nettoyé).

### Action

Supprimer l'enregistrement suivant de la table `bookings_hg` :
- **ID Supabase** : `a6665371-2e51-4532-8154-87620c74b622`
- **HG Booking ID** : `2106998`
- **Statut** : PendingReview (non annulé)

### Détail technique

Exécuter un `DELETE` sur la table `bookings_hg` pour cet enregistrement unique, via l'outil d'insertion/modification de données.

