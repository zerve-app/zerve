# workflow notes

- createSession (email/sms, no token)
  - strategy.authorize
- createSession (email/sms, w token)
  - strategy.authorize
    - returns truthy
  - find or create authenticator file with strategy + authenticatorId
  - if authenticator file exists, check for "username" field
  - if existingUsername exists
    - load
  - create session

## ids in this auth system

strategyName: "Email", "Phone", key in the object of strategies passed to auth
strategyKey: the key within one strategy
authenticatorId: hash of strategyName + strategyKey
userId: under users/ folder, defaults to the authenticatorId
