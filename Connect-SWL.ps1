# PowerShellスクリプト: Connect-WSL.ps1

# 管理者権限で実行されているか確認
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent().User.Value)) {
    Start-Process powershell -Verb RunAs "-File `"$PSCommandPath`""
    exit
}

Write-Host "WSL2のネットワークポートフォワーディングを設定します..." -ForegroundColor Cyan

# 既存のポートプロキシ設定をリセット
netsh interface portproxy reset

# Ubuntu側のIPアドレスを取得
$wslIP = wsl hostname -I | Select-Object -First 1

if (-not $wslIP) {
    Write-Host "WSL IPアドレスを取得できませんでした。WSLが起動していることを確認してください。" -ForegroundColor Red
    exit 1
}

$wslIP = $wslIP.Trim() # 余分な空白を削除

Write-Host "WSL2 IPアドレス: $wslIP" -ForegroundColor Green

# ポートフォワーディングの設定
$ports = @("5173", "3000") # Viteとバックエンドのポート

foreach ($port in $ports) {
    $command = "netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIP"
    Invoke-Expression $command
    Write-Host "ポート $port を $wslIP にフォワードしました。" -ForegroundColor Green
}

Write-Host "設定が完了しました。" -ForegroundColor Cyan

# Windowsファイアウォールでポートを開放するコマンド例 (必要なら手動実行)
# Write-Host "必要に応じて、WindowsファイアウォールでTCPポート 5173, 3000 を許可してください。" -ForegroundColor Yellow
