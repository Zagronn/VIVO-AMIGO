# PRO-VIVO 2026 Ulusal Güvenlik Belgesi

**Sınıflandırma:** Kurumsal kontrol standardı / partner pilot eki  
**Kapsam:** `vivoamigo.com`, `payvivoamigo.com`, `cargovivo.com`  
**Durum:** Taslak; hukuki, regülasyon, partner ve güvenlik ekiplerinin onayı olmadan aktif politika değildir.

## 1. Büyük Göç Operasyonu

“Büyük Göç”, Banco Industrial, Banrural, Tigo ve Claro müşterilerinin partner onaylı, rızaya dayalı ve iki aylık komisyon kampanyasıyla vivoamigo ekosistemini keşfetmesini sağlayan kontrollü pilot olarak tanımlanır. Rekabet “müşteri savaşına” değil, şeffaf ve opt-in teklif karşılaştırmasına dayanır.

### Pilot şartları

- İki aylık sıfır komisyon yalnızca aktif kampanya, uygun kullanıcı ve yayınlanmış şartlar için geçerlidir.
- Partner müşterileri otomatik taşınmaz; açık rıza, kimlik eşleme ve veri aktarım amacı gerekir.
- Partnerler birbirlerinin müşteri listelerine erişemez. Her partner yalnızca kendi yetkili kanalının kampanya sonuçlarını görür.
- SMS, push, zero-rating, kredi veya ödeme entegrasyonu signed agreement ve provider API approval olmadan aktif sayılmaz.
- Kampanya; bütçe, frekans, opt-out, şikayet, süre ve geri alma sınırlarıyla time-boxed yürütülür.

## 2. VivoPay Data Architecture

### Veri bölgeleri

| Bölge | Saklanan veri | Yasak |
| --- | --- | --- |
| Identity Vault | Tokenized Digital Trade ID, provider reference, consent reference | Ham DPI, PAN, biometric template |
| Pay Ledger | Wallet ID, amount, currency, idempotency key, status, audit timestamps | Kart numarası, gereksiz partner profili |
| VERI-SHIELD Evidence | Hash, score, evidence reference, policy/model version | Kamuya açık ham belge ve registry payload |
| Campaign Events | Campaign ID, partner, channel, consent version, aggregate-safe event | Consent dışı audience enrichment |
| Sponsor Metrics | Consentli toplulaştırılmış dönüşüm ve opt-out metrikleri | Tekil kullanıcı davranış profili |

### Veri akışı

1. Partner, kullanıcıyı kendi kanalında bilgilendirir.
2. Kullanıcı consent ekranında amaç, süre, partner, iletişim kanalı ve opt-out hakkını görür.
3. `vivoamigo.com` consent reference ve tokenized identity oluşturur.
4. `payvivoamigo.com` wallet/escrow işlemlerini idempotent ledger’a yazar.
5. `cargovivo.com` yalnızca gerekli teslimat/dispatch referanslarını alır.
6. Sponsor raporları minimum örneklem ve aggregate-only kurallarıyla üretilir.

## 3. VERI-SHIELD Controls

- Deny by default ve server-side authorization.
- Vault isolation ve encryption at rest/in transit.
- Consent version, purpose, timestamp ve revocation kaydı.
- Partner tenant ayrımı ve least privilege.
- Append-only audit event ve replay/idempotency koruması.
- Data minimization, retention süresi ve silme/anonimleştirme prosedürü.
- Provider timeout, uyumsuzluk veya emergency lock durumunda fail-closed manual review.
- Devin, partner onayı veya resmi kurum sonucunu simüle edemez.

## 4. Partner Savaş Planı Değil, Kontrollü Pazar Pilotu

Partner teklifleri şu çerçevede karşılaştırılır:

- **Banco Industrial / Banrural:** Kredi başvuru yerleşimi, bankanın kendi underwriting ve disclosure akışıyla.
- **Tigo / Claro:** Opt-in SMS/push, izinli sponsored-data veya zero-rating pilotu ve ödeme adapter’larıyla.
- **VivoPay:** Tokenized wallet, escrow, transfer ve audit altyapısı.
- **CARGO VIVO:** Teslimat, saha desteği ve durum kanıtı.

Başarı; rakip müşteriyi ele geçirmekle değil, consent oranı, doğrulanmış migration, tamamlanan işlem, opt-out, şikayet, dispute ve partner inventory value ile ölçülür.

## 5. Sıfır Sermaye Modeli

Hedef “zero upfront media budget” pilotudur; gerçek operasyon maliyetinin sıfır olduğu iddia edilmez. Her partner kendi altyapı, regülasyon, destek ve uyum maliyetini taşır. Barter, medya envanteri, referral veya revenue-share yalnızca imzalı sözleşmeyle geçerlidir.

## 6. Release Gate

Her kampanya veya veri adapter değişikliğinde `npm test`, `npm run security:audit`, consent review, privacy review, partner approval, rollback planı ve audit evidence gerekir. Eksik toolchain/credential deployment başarısı gibi raporlanmaz.