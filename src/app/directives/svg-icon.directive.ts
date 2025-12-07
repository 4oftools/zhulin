import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Directive({
  selector: '[appSvgIcon]',
  standalone: false
})
export class SvgIconDirective implements OnInit {
  @Input() appSvgIcon!: string;
  private safeHtml: SafeHtml = '';

  constructor(
    private el: ElementRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    if (this.appSvgIcon) {
      this.http.get(this.appSvgIcon, { responseType: 'text' }).subscribe({
        next: (svgContent: string) => {
          // 直接使用字符串，因为 SVG 内容来自可信源（assets 目录）
          this.el.nativeElement.innerHTML = svgContent;
        },
        error: (err) => {
          console.error('Failed to load SVG:', err);
        }
      });
    }
  }
}

