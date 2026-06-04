#!/usr/bin/env python3
"""
交互式物品分割工具 (Interactive Crop Tool)
=========================================
用途：在地图背景图上框选物品，预览并保存为独立 sprite 文件
用法：python interactive_crop.py <背景图路径> [输出目录]

操作说明：
  - 鼠标拖拽：框选区域
  - 鼠标滚轮：缩放图片
  - 右键点击：删除最后一个框选区域
  - 按 Enter/Space：确认裁剪当前框选区域
  - 按 Ctrl+Z：撤销上一次裁剪
  - 按 Ctrl+S：快速保存（使用自动编号）
  - 按 Esc：取消当前框选
  - 保存后自动进入下一个物品编号

严格遵循 07_地图系统开发文档_v1.0.md 规范：
  - 输出尺寸：256×256 px（Phaser 标准要求）
  - 输出格式：PNG + 透明背景
  - 命名规范：item_XX.png（XX 为两位数字，从 01 开始）
  - 输出目录：{地图目录}/教师办公室物品_sprites/
"""

import sys
import os
import json
from pathlib import Path
from PIL import Image, ImageTk, ImageDraw
import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog
import glob

# ============================================================
# 配置区（可按地图修改）
# ============================================================
OUTPUT_SIZE = (256, 256)          # Phaser 标准 sprite 尺寸
NAME_PREFIX = "item_"              # 文件命名前缀
NAME_DIGITS = 2                   # 编号位数（01, 02...）
IMAGE_LAYER_NAME = "ground"        # Tiled Image Layer 名称
# ============================================================


class InteractiveCropTool:
    def __init__(self, root, image_path, output_dir=None):
        self.root = root
        self.image_path = Path(image_path).resolve()
        self.map_dir = self.image_path.parent
        self.output_dir = Path(output_dir) if output_dir else self.map_dir / f"{self.image_path.stem}物品_sprites"
        self.output_dir.mkdir(exist_ok=True)

        self.root.title(f"物品分割工具 — {self.image_path.name}")
        self.root.geometry("1400x900")

        # 状态
        self.original_image = Image.open(self.image_path).convert("RGBA")
        self.scale = 1.0
        self.min_scale = 0.1
        self.max_scale = 5.0
        self.rectangles = []          # [(x1, y1, x2, y2), ...] 原始图片坐标
        self.current_rect = None      # 正在拖拽的矩形 (sx, sy, ex, ey)
        self.drawing = False
        self.crop_history = []       # 撤销栈

        # 已保存文件列表
        self.saved_files = sorted(self.output_dir.glob(f"{NAME_PREFIX}*.png"))

        # UI 布局
        self.setup_ui()
        self.load_image()
        self.update_preview()
        self.log(f"✅ 已加载：{self.image_path.name}  ({self.original_image.width}×{self.original_image.height})")
        self.log(f"📁 输出目录：{self.output_dir}")
        self.log(f"📦 已保存 {len(self.saved_files)} 个物品，下一个编号：{self.get_next_id():02d}")
        self.log("─" * 50)
        self.log("操作：拖拽框选 → 按 Enter 裁剪 → 输入名称（或空=自动编号）→ 保存")
        self.log("快捷键：滚轮=缩放 | 右键=删最后一个框 | Ctrl+Z=撤销 | Ctrl+S=快速保存")

    # ──────────────────────────────────────────────
    # UI 布局
    # ──────────────────────────────────────────────
    def setup_ui(self):
        # 顶部工具栏
        toolbar = tk.Frame(self.root, bd=2, relief=tk.RAISED)
        toolbar.pack(side=tk.TOP, fill=tk.X, padx=4, pady=2)

        tk.Button(toolbar, text="📂 打开图片", command=self.open_image, width=12).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="💾 保存选中", command=self.crop_and_save, width=12).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="⚡ 快速保存", command=self.quick_save, width=12).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="🗑 删除最后一区", command=self.delete_last_rect, width=14).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="📋 生成 Tiled JSON", command=self.generate_tiled_json, width=16).pack(side=tk.LEFT, padx=2)
        tk.Button(toolbar, text="👁 预览所有 Sprite", command=self.preview_sprites, width=14).pack(side=tk.LEFT, padx=2)

        self.zoom_label = tk.Label(toolbar, text="缩放: 100%", width=12)
        self.zoom_label.pack(side=tk.RIGHT, padx=4)

        self.cursor_label = tk.Label(toolbar, text="坐标: (-, -)", width=20, anchor="w")
        self.cursor_label.pack(side=tk.RIGHT, padx=4)

        # 主区域：左侧画布 + 右侧面板
        main = tk.Frame(self.root)
        main.pack(side=tk.TOP, fill=tk.BOTH, expand=True, padx=4, pady=2)

        # 左侧：画布
        canvas_frame = tk.Frame(main)
        canvas_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(canvas_frame, bg="#1a1a2e", highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)

        hbar = tk.Scrollbar(canvas_frame, orient=tk.HORIZONTAL, command=self.canvas.xview)
        hbar.pack(side=tk.BOTTOM, fill=tk.X)
        vbar = tk.Scrollbar(canvas_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        vbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.canvas.config(xscrollcommand=hbar.set, yscrollcommand=vbar.set)

        # 右侧：日志 + 物品列表
        right_panel = tk.Frame(main, width=280)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, padx=(4, 0))
        right_panel.pack_propagate(False)

        tk.Label(right_panel, text="📦 已保存物品", font=("微软雅黑", 10, "bold")).pack(anchor="w", pady=(0, 4))

        list_frame = tk.Frame(right_panel)
        list_frame.pack(fill=tk.BOTH, expand=True)

        self.item_listbox = tk.Listbox(list_frame, font=("Consolas", 9), selectmode=tk.SINGLE)
        self.item_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        list_sb = tk.Scrollbar(list_frame, command=self.item_listbox.yview)
        list_sb.pack(side=tk.RIGHT, fill=tk.Y)
        self.item_listbox.config(yscrollcommand=list_sb.set)
        self.item_listbox.bind("<<ListboxSelect>>", self.on_item_select)

        tk.Button(right_panel, text="🗑 删除选中物品", command=self.delete_selected_item,
                  bg="#ff6b6b", fg="white").pack(fill=tk.X, pady=(4, 2))

        tk.Label(right_panel, text="📝 操作日志", font=("微软雅黑", 10, "bold")).pack(anchor="w", pady=(8, 4))

        self.log_text = tk.Text(right_panel, height=12, font=("Consolas", 8), wrap=tk.WORD, bg="#f8f9fa")
        self.log_text.pack(fill=tk.BOTH, expand=True)

        # 绑定事件
        self.canvas.bind("<ButtonPress-1>", self.on_mouse_down)
        self.canvas.bind("<B1-Motion>", self.on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_mouse_up)
        self.canvas.bind("<Motion>", self.on_mouse_move)
        self.canvas.bind("<MouseWheel>", self.on_mouse_wheel)
        self.canvas.bind("<Button-3>", lambda e: self.delete_last_rect())
        self.root.bind("<Return>", lambda e: self.crop_and_save())
        self.root.bind("<space>", lambda e: self.crop_and_save())
        self.root.bind("<Control-z>", lambda e: self.undo_last_crop())
        self.root.bind("<Control-s>", lambda e: self.quick_save())
        self.root.bind("<Escape>", self.cancel_current_rect)
        self.root.bind("<Control-plus>", lambda e: self.zoom(1.1))
        self.root.bind("<Control-minus>", lambda e: self.zoom(0.9))

        # 适应窗口
        self.root.after(100, self.fit_to_window)

    # ──────────────────────────────────────────────
    # 图片加载与显示
    # ──────────────────────────────────────────────
    def load_image(self):
        self.resized_image = self.original_image.resize(
            (int(self.original_image.width * self.scale),
             int(self.original_image.height * self.scale)),
            Image.LANCZOS
        )
        self.tk_image = ImageTk.PhotoImage(self.resized_image)
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.tk_image, tags="bg")
        self.canvas.config(scrollregion=self.canvas.bbox("all"))
        self.draw_rectangles()
        self.update_zoom_label()

    def fit_to_window(self):
        cw = self.canvas.winfo_width() or 1000
        ch = self.canvas.winfo_height() or 700
        iw, ih = self.original_image.size
        self.scale = min(cw / iw, ch / ih) * 0.9
        self.scale = max(self.min_scale, min(self.max_scale, self.scale))
        self.load_image()

    def zoom(self, factor):
        mx = self.canvas.canvasx(self.canvas.winfo_width() / 2)
        my = self.canvas.canvasy(self.canvas.winfo_height() / 2)
        self.scale = max(self.min_scale, min(self.max_scale, self.scale * factor))
        self.load_image()
        # 保持中心
        new_mx = self.canvas.canvasx(self.canvas.winfo_width() / 2)
        new_my = self.canvas.canvasy(self.canvas.winfo_height() / 2)
        self.canvas.move("all", mx - new_mx, my - new_my)

    def update_zoom_label(self):
        self.zoom_label.config(text=f"缩放: {int(self.scale * 100)}%")

    # ──────────────────────────────────────────────
    # 鼠标事件
    # ──────────────────────────────────────────────
    def canvas_to_image(self, cx, cy):
        """画布坐标 → 原始图片坐标"""
        ix = cx / self.scale
        iy = cy / self.scale
        return int(ix), int(iy)

    def image_to_canvas(self, ix, iy):
        """原始图片坐标 → 画布坐标"""
        return ix * self.scale, iy * self.scale

    def on_mouse_down(self, event):
        cx = self.canvas.canvasx(event.x)
        cy = self.canvas.canvasy(event.y)
        ix, iy = self.canvas_to_image(cx, cy)
        self.current_rect = (ix, iy, ix, iy)
        self.drawing = True

    def on_mouse_drag(self, event):
        if not self.drawing:
            return
        cx = self.canvas.canvasx(event.x)
        cy = self.canvas.canvasy(event.y)
        ix, iy = self.canvas_to_image(cx, cy)
        self.current_rect = (self.current_rect[0], self.current_rect[1], ix, iy)
        self.draw_rectangles()

    def on_mouse_up(self, event):
        if not self.drawing:
            return
        self.drawing = False
        if self.current_rect is None:
            return
        x1, y1, x2, y2 = self.current_rect
        x1, x2 = sorted([x1, x2])
        y1, y2 = sorted([y1, y2])
        w, h = x2 - x1, y2 - y1
        if w < 5 or h < 5:
            self.log("⚠️  框选区域太小，已忽略")
            self.current_rect = None
            self.draw_rectangles()
            return
        self.rectangles.append((x1, y1, x2, y2))
        self.current_rect = None
        self.draw_rectangles()
        self.log(f"➕ 已添加框选区域 #{len(self.rectangles)}：({x1},{y1})→({x2},{y2})  {w}×{h}px")

    def on_mouse_move(self, event):
        cx = self.canvas.canvasx(event.x)
        cy = self.canvas.canvasy(event.y)
        ix, iy = self.canvas_to_image(cx, cy)
        ix = max(0, min(self.original_image.width, ix))
        iy = max(0, min(self.original_image.height, iy))
        self.cursor_label.config(text=f"坐标: ({ix}, {iy})")
        self.draw_rectangles()  # 实时刷新当前拖拽框

    def on_mouse_wheel(self, event):
        factor = 1.1 if event.delta > 0 else 0.9
        self.zoom(factor)

    def cancel_current_rect(self, event=None):
        if self.drawing:
            self.drawing = False
            self.current_rect = None
            self.draw_rectangles()
            self.log("❌ 已取消当前框选")

    # ──────────────────────────────────────────────
    # 矩形绘制
    # ──────────────────────────────────────────────
    def draw_rectangles(self):
        self.canvas.delete("rect")
        # 已确认的框
        for i, (x1, y1, x2, y2) in enumerate(self.rectangles):
            cx1, cy1 = self.image_to_canvas(x1, y1)
            cx2, cy2 = self.image_to_canvas(x2, y2)
            color = "#00ff88" if i == len(self.rectangles) - 1 else "#ffd93d"
            self.canvas.create_rectangle(cx1, cy1, cx2, cy2,
                                       outline=color, width=2, tags="rect")
            self.canvas.create_text(cx1 + 4, cy1 + 4,
                                   text=f"#{i+1}", fill=color,
                                   anchor=tk.NW, font=("Arial", 10, "bold"), tags="rect")
        # 正在拖拽的框
        if self.drawing and self.current_rect:
            x1, y1, x2, y2 = self.current_rect
            cx1, cy1 = self.image_to_canvas(x1, y1)
            cx2, cy2 = self.image_to_canvas(x2, y2)
            self.canvas.create_rectangle(cx1, cy1, cx2, cy2,
                                       outline="#ff6b6b", width=2,
                                       dash=(4, 2), tags="rect")

    # ──────────────────────────────────────────────
    # 裁剪与保存
    # ──────────────────────────────────────────────
    def get_next_id(self):
        existing = [int(p.stem.split("_")[-1]) for p in self.output_dir.glob(f"{NAME_PREFIX}*.png")
                   if p.stem.split("_")[-1].isdigit()]
        return max(existing) + 1 if existing else 1

    def crop_and_save(self, event=None):
        if not self.rectangles:
            messagebox.showwarning("无框选区域", "请先拖拽框选要分割的物品区域。")
            return
        # 裁剪最后一个框选区域
        rect = self.rectangles[-1]
        self._do_crop(rect, auto_name=False)

    def quick_save(self, event=None):
        """Ctrl+S 快速保存：使用自动编号，不弹对话框"""
        if not self.rectangles:
            self.log("⚠️  没有可保存的框选区域")
            return
        rect = self.rectangles[-1]
        self._do_crop(rect, auto_name=True)

    def _do_crop(self, rect, auto_name=False):
        x1, y1, x2, y2 = rect
        # 扩展一点边距
        pad = 4
        x1 = max(0, x1 - pad)
        y1 = max(0, y1 - pad)
        x2 = min(self.original_image.width, x2 + pad)
        y2 = min(self.original_image.height, y2 + pad)

        cropped = self.original_image.crop((x1, y1, x2, y2))

        # 缩放到标准尺寸（保持宽高比，多余部分透明）
        final = Image.new("RGBA", OUTPUT_SIZE, (0, 0, 0, 0))
        cw, ch = cropped.size
        scale = min(OUTPUT_SIZE[0] / cw, OUTPUT_SIZE[1] / ch)
        new_w, new_h = int(cw * scale), int(ch * scale)
        resized = cropped.resize((new_w, new_h), Image.LANCZOS)
        # 居中放置
        ox = (OUTPUT_SIZE[0] - new_w) // 2
        oy = (OUTPUT_SIZE[1] - new_h) // 2
        final.paste(resized, (ox, oy), resized if resized.mode == "RGBA" else None)

        # 命名
        if auto_name:
            next_id = self.get_next_id()
            name = f"{NAME_PREFIX}{next_id:02d}"
        else:
            default_name = f"{NAME_PREFIX}{self.get_next_id():02d}"
            name = simpledialog.askstring(
                "输入物品名称",
                f"框选区域：({x1},{y1})→({x2},{y2})  {x2-x1}×{y2-y1}px\n\n"
                f"自动建议名：{default_name}\n"
                f"保存到：{self.output_dir.name}/\n\n"
                "输入名称（不含扩展名，留空使用自动编号）：",
                initialvalue=default_name,
                parent=self.root
            )
            if name is None:
                self.log("❌ 用户取消保存")
                return
            if name.strip() == "":
                name = default_name
            else:
                name = name.strip()
                # 确保有 item_ 前缀
                if not name.startswith(NAME_PREFIX.strip("_")):
                    name = NAME_PREFIX + name

        save_path = self.output_dir / f"{name}.png"
        # 避免覆盖
        counter = 1
        while save_path.exists() and not auto_name:
            save_path = self.output_dir / f"{name}_{counter:02d}.png"
            counter += 1

        final.save(save_path)
        self.crop_history.append((save_path, rect))
        self.rectangles.pop()  # 移除已保存的框
        self.update_item_list()
        self.draw_rectangles()
        self.log(f"✅ 已保存：{save_path.name}  ({final.size[0]}×{final.size[1]}) → {save_path}")
        self.log(f"   Tiled object 建议 name: \"{name}\",  size: {x2-x1}×{y2-y1}px")

    def undo_last_crop(self):
        if not self.crop_history:
            self.log("⚠️  没有可撤销的操作")
            return
        path, rect = self.crop_history.pop()
        if path.exists():
            path.unlink()
            self.log(f"↩️  已撤销并删除：{path.name}")
        self.rectangles.append(rect)
        self.update_item_list()
        self.draw_rectangles()

    def delete_last_rect(self):
        if self.rectangles:
            removed = self.rectangles.pop()
            self.draw_rectangles()
            self.log(f"🗑  已删除最后一个框选区域 {removed}")
        else:
            self.log("⚠️  没有可删除的框选区域")

    # ──────────────────────────────────────────────
    # 物品列表管理
    # ──────────────────────────────────────────────
    def update_item_list(self):
        self.item_listbox.delete(0, tk.END)
        files = sorted(self.output_dir.glob("*.png"))
        for f in files:
            size_kb = f.stat().st_size // 1024
            self.item_listbox.insert(tk.END, f"{f.name}  ({size_kb}KB)")
        self.saved_files = files

    def on_item_select(self, event):
        sel = self.item_listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        files = sorted(self.output_dir.glob("*.png"))
        if idx < len(files):
            self.preview_sprite_file(files[idx])

    def delete_selected_item(self):
        sel = self.item_listbox.curselection()
        if not sel:
            messagebox.showwarning("未选择", "请先在右侧列表中选择要删除的物品。")
            return
        idx = sel[0]
        files = sorted(self.output_dir.glob("*.png"))
        if idx < len(files):
            f = files[idx]
            if messagebox.askyesno("确认删除", f"确定要删除 {f.name} 吗？\n（磁盘文件将被删除）"):
                f.unlink()
                self.log(f"🗑  已删除：{f.name}")
                self.update_item_list()

    def preview_sprite_file(self, path):
        """在画布上预览某个已保存的 sprite"""
        img = Image.open(path).convert("RGBA")
        preview = img.resize((256, 256), Image.LANCZOS)
        # 在画布中央显示（简单用新窗口）
        self._show_preview_window(preview, path.name)

    def _show_preview_window(self, img, title):
        win = tk.Toplevel(self.root)
        win.title(f"预览 — {title}")
        tk_img = ImageTk.PhotoImage(img)
        label = tk.Label(win, image=tk_img)
        label.image = tk_img
        label.pack(padx=8, pady=8)
        tk.Label(win, text=f"{img.size[0]}×{img.size[1]}px  PNG RGBA").pack(pady=(0, 8))

    # ──────────────────────────────────────────────
    # Tiled JSON 生成
    # ──────────────────────────────────────────────
    def generate_tiled_json(self):
        """为当前地图生成 Tiled JSON 中的 furniture_objects 层（物品对象列表）"""
        sprites_dir = self.output_dir
        if not sprites_dir.exists():
            messagebox.showerror("错误", f"目录不存在：{sprites_dir}")
            return

        png_files = sorted(sprites_dir.glob("*.png"))
        if not png_files:
            messagebox.showinfo("无物品", "还没有保存任何物品 sprite。")
            return

        # 读取原始图片尺寸
        img_w, img_h = self.original_image.size

        # 尝试从同名 JSON 读取已有配置
        json_path = self.map_dir / f"{self.image_path.stem}.json"
        existing_objects = []
        if json_path.exists():
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for layer in data.get("layers", []):
                    if layer.get("name") == "furniture_objects":
                        existing_objects = {o["name"]: o for o in layer.get("objects", [])}
                        break
            except Exception as e:
                self.log(f"⚠️  读取已有 JSON 失败：{e}")

        # 构建对象列表（位置为占位 0,0，需在 Tiled 中手动调整）
        objects = []
        for i, png_path in enumerate(png_files):
            name = png_path.stem
            # 尝试从 crop_history 或让用户指定位置
            obj = {
                "name": name,
                "type": "furniture",
                "x": 0,
                "y": 0,
                "width": 256,
                "height": 256,
                "visible": True,
                "properties": [
                    {"name": "itemId", "type": "string", "value": name},
                    {"name": "interactable", "type": "bool", "value": True}
                ]
            }
            # 如果有历史位置，使用之
            if hasattr(self, '_last_crop_positions') and name in self._last_crop_positions:
                px, py = self._last_crop_positions[name]
                obj["x"] = px
                obj["y"] = py
            objects.append(obj)

        result = json.dumps(objects, ensure_ascii=False, indent=2)

        # 保存到剪贴板 + 文件
        self.root.clipboard_clear()
        self.root.clipboard_append(result)
        out_json = self.map_dir / f"{self.image_path.stem}_furniture_objects.json"
        with open(out_json, "w", encoding="utf-8") as f:
            f.write(result)

        self.log(f"📋 已生成 {len(objects)} 个物品对象定义")
        self.log(f"   JSON 已保存到：{out_json.name}")
        self.log(f"   JSON 已复制到剪贴板")
        self.log("─" * 50)
        self.log("📝 下一步：在 Tiled 编辑器中打开地图，将以上对象粘贴到 furniture_objects 层")
        messagebox.showinfo(
            "Tiled JSON 已生成",
            f"已生成 {len(objects)} 个物品对象\n\n"
            f"JSON 保存到：\n{out_json}\n\n"
            "内容已复制到剪贴板，可粘贴到 Tiled JSON 的 furniture_objects 层的 objects 数组中。\n\n"
            "注意：x/y 坐标为占位值（0,0），请在 Tiled 编辑器中手动拖拽调整每个物品的位置。"
        )

    # ──────────────────────────────────────────────
    # 预览所有 Sprite
    # ──────────────────────────────────────────────
    def preview_sprites(self):
        """在新窗口中展示所有已保存的 sprite"""
        files = sorted(self.output_dir.glob("*.png"))
        if not files:
            messagebox.showinfo("无物品", "还没有保存任何物品 sprite。")
            return

        win = tk.Toplevel(self.root)
        win.title(f"所有物品预览 — {len(files)} 个")
        win.geometry("1100x700")

        canvas = tk.Canvas(win, bg="#2d3436")
        canvas.pack(fill=tk.BOTH, expand=True, padx=4, pady=4)

        # 平铺显示
        cols = 4
        thumb_size = 200
        for i, fpath in enumerate(files):
            img = Image.open(fpath).convert("RGBA")
            img.thumbnail((thumb_size, thumb_size), Image.LANCZOS)
            tk_img = ImageTk.PhotoImage(img)
            row, col = i // cols, i % cols
            x = col * (thumb_size + 20) + 10
            y = row * (thumb_size + 40) + 10
            canvas.create_image(x + thumb_size // 2, y + thumb_size // 2, image=tk_img)
            canvas.create_text(x + thumb_size // 2, y + thumb_size + 18,
                              text=fpath.name, fill="#dfe6e9", font=("Consolas", 9))
            canvas.image_refs = getattr(canvas, 'image_refs', [])
            canvas.image_refs.append(tk_img)

        canvas.config(scrollregion=canvas.bbox("all"))
        self.log(f"👁  已打开预览窗口：{len(files)} 个物品")

    # ──────────────────────────────────────────────
    # 打开新图片
    # ──────────────────────────────────────────────
    def open_image(self):
        path = filedialog.askopenfilename(
            title="选择地图背景图",
            filetypes=[("PNG 图片", "*.png"), ("所有文件", "*.*")]
        )
        if path:
            self.image_path = Path(path).resolve()
            self.map_dir = self.image_path.parent
            self.output_dir = self.map_dir / f"{self.image_path.stem}物品_sprites"
            self.output_dir.mkdir(exist_ok=True)
            self.original_image = Image.open(self.image_path).convert("RGBA")
            self.rectangles = []
            self.current_rect = None
            self.crop_history = []
            self.scale = 1.0
            self.root.title(f"物品分割工具 — {self.image_path.name}")
            self.load_image()
            self.update_item_list()
            self.log(f"✅ 已切换图片：{self.image_path.name}")

    # ──────────────────────────────────────────────
    # 日志
    # ──────────────────────────────────────────────
    def log(self, msg):
        self.log_text.insert(tk.END, msg + "\n")
        self.log_text.see(tk.END)
        print(msg)


# ============================================================
# 主程序
# ============================================================
def main():
    if len(sys.argv) < 2:
        # 没有参数，弹出文件选择对话框
        root = tk.Tk()
        root.withdraw()
        image_path = filedialog.askopenfilename(
            title="选择要分割物品的地图背景图",
            filetypes=[("PNG 图片", "*.png"), ("所有文件", "*.*")]
        )
        if not image_path:
            print("未选择图片，退出。")
            sys.exit(0)
        root.destroy()
        # 重新创建主窗口
        root = tk.Tk()
        app = InteractiveCropTool(root, image_path)
    else:
        image_path = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        root = tk.Tk()
        app = InteractiveCropTool(root, image_path, output_dir)

    root.mainloop()


if __name__ == "__main__":
    main()
