Native app, most of implementation is in `packages/zoo`

`ios` and `android` dirs can be deleted, then re-created:

1. `expo prebuild`
2. in the ios info plist, set <key>UIViewControllerBasedStatusBarAppearance</key> to <true/>
