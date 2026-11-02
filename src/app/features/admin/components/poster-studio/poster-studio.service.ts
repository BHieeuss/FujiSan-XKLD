import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StudioStockPhoto } from './poster-studio.models';

@Injectable({
  providedIn: 'root',
})
export class PosterStudioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/admin-api/poster-studio.php';
  private readonly uploadUrl = '/admin-api/order-image.php';

  getDraft(orderId?: string): Observable<{ draft: any; stockPhotos?: StudioStockPhoto[] }> {
    let params = new HttpParams().set('action', 'get-draft');
    if (orderId) {
      params = params.set('orderId', orderId);
    }
    return this.http.get<{ draft: any; stockPhotos?: StudioStockPhoto[] }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  saveDraft(payload: any): Observable<{ message: string; draft: any }> {
    const params = new HttpParams().set('action', 'save-draft');
    return this.http.post<{ message: string; draft: any }>(this.baseUrl, payload, {
      params,
      withCredentials: true,
    });
  }

  clearDraft(orderId?: string): Observable<{ message: string }> {
    const params = new HttpParams().set('action', 'clear-draft');
    return this.http.post<{ message: string }>(this.baseUrl, { orderId }, {
      params,
      withCredentials: true,
    });
  }

  applyToOrder(orderId: string, posterUrl: string): Observable<{ message: string; order: any }> {
    const params = new HttpParams().set('action', 'apply-to-order');
    return this.http.post<{ message: string; order: any }>(
      this.baseUrl,
      { orderId, posterUrl },
      { params, withCredentials: true }
    );
  }

  uploadPosterBlob(blob: Blob, fileName: string = 'poster-viejap.png'): Observable<{ success: boolean; imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', blob, fileName);
    return this.http.post<{ success: boolean; imageUrl: string }>(this.uploadUrl, formData, {
      withCredentials: true,
    });
  }

  getStockPhotos(): Observable<{ photos: StudioStockPhoto[] }> {
    const params = new HttpParams().set('action', 'stock-photos');
    return this.http.get<{ photos: StudioStockPhoto[] }>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }
}

