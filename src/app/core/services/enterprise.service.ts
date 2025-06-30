// src/app/core/services/enterprise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CustomPromptResponse, QrCodeResponse, UpdatePromptRequest, Enterprise } from '../models/enterprise.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCustomPrompt(enterpriseId: string): Observable<CustomPromptResponse> {
    const url = `${this.baseUrl}${environment.endpoints.enterprise.getCustomPrompt(enterpriseId)}`;
    
    return this.http.get<CustomPromptResponse>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateCustomPrompt(enterpriseId: string, request: UpdatePromptRequest): Observable<void> {
    const url = `${this.baseUrl}${environment.endpoints.enterprise.updatePrompt(enterpriseId)}`;
    
    return this.http.patch<void>(url, request).pipe(
      catchError(this.handleError)
    );
  }

  getQrCode(enterpriseId: string): Observable<QrCodeResponse> {
  return this.http.get<QrCodeResponse>(
    `${this.baseUrl}/Enterprise/${enterpriseId}/qr-code`
  );  }

  getEnterpriseById(enterpriseId: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${this.baseUrl}/Enterprise/${enterpriseId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos';
          break;
        case 401:
          errorMessage = 'Não autorizado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro: ${error.status} - ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}



