# Firestore Rules (rezervasyon + admin panel)

Bu repo içinde `firebase.json`/deploy yoksa bile, aşağıdaki rules bloğunu Firebase Console → Firestore Database → Rules ekranına yapıştırabilirsiniz.

> Admin allowlist: `uzelemehmet@gmail.com` ve `articelikkapi@gmail.com`

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email in [
          'uzelemehmet@gmail.com',
          'articelikkapi@gmail.com'
        ]
      );
    }

    // Public read, admin write
    match /tours/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /imageUrls/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /siteSettings/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Reservations
    match /reservations/{reservationId} {
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow update, delete: if isAdmin();
    }
  }
}
```

Notlar:
- Bu yaklaşım email allowlist ile hızlı güvenlik sağlar.
- Daha sağlam model için admin kullanıcılarına Firebase Custom Claims (ör. `admin: true`) vermek daha iyidir.
