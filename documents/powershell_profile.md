# $PROFILE

```ps
❯ $PROFILE
C:\Users\Sanghyo Lee\Documents\PowerShell\Microsoft.PowerShell_profile.ps1

❯ cat "C:\Users\Sanghyo Lee\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
# FNM Shell Integration
fnm env --use-on-cd | Out-String | Invoke-Expression

Invoke-Expression (&starship init powershell)
```