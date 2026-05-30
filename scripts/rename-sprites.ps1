# 重命名 classroom 和 classroom_3 的物品sprites为连续编号
# 使用方法：在 PowerShell 中运行 .\rename-sprites.ps1

$dirs = @(
    "G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\classroom\物品_sprites",
    "G:\混沌\happy-child-game-scaffold\happy-child-game\client\public\assets\maps\classroom_3\物品_sprites"
)

foreach ($dir in $dirs) {
    Write-Host "`n处理: $dir"

    # 获取当前文件按名称排序
    $files = Get-ChildItem $dir -Filter "item_*.png" | Sort-Object Name
    Write-Host "  当前文件: $($files.Name -join ', ')"

    # 步骤1: 重命名为临时名（避免冲突）
    $idx = 1
    foreach ($f in $files) {
        $tmpName = "__tmp_{0:D2}.png" -f $idx
        Rename-Item $f.FullName -NewName $tmpName -Force
        $idx++
    }

    # 步骤2: 从临时名重命名为最终连续编号
    $tmpFiles = Get-ChildItem $dir -Filter "__tmp_*.png" | Sort-Object Name
    $idx = 1
    foreach ($f in $tmpFiles) {
        $finalName = "item_{0:D2}.png" -f $idx
        Rename-Item $f.FullName -NewName $finalName -Force
        $idx++
    }

    # 验证结果
    $result = Get-ChildItem $dir -Filter "item_*.png" | Sort-Object Name
    Write-Host "  重命名后: $($result.Name -join ', ')"
    Write-Host "  共 $($result.Count) 个文件"
}

Write-Host "`n完成！"
