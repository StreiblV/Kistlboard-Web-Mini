import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, Observable, throwError } from 'rxjs'

import {
  KistlCard,
  KistlMedia,
  PayloadListResponse,
} from '../models/kistlboard.models'

interface PayloadMutationResponse<T> {
  doc: T
  message?: string
}

@Injectable({
  providedIn: 'root',
})
export class KistlboardService {
  private readonly cardsApi = '/api/cards'
  private readonly mediaApi = '/api/media'

  private readonly maxUploadSizeBytes = 1024 * 1024 * 1024 // 1 GB

  constructor(private readonly http: HttpClient) {}

  getCards(): Observable<KistlCard[]> {
    return this.http
      .get<PayloadListResponse<KistlCard>>(
        `${this.cardsApi}?depth=2&limit=100&sort=plannedPostingDate`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.docs.filter((card) => !card.archived)),
      )
  }

  createCard(card: Partial<KistlCard>): Observable<KistlCard> {
    return this.http
        .post<KistlCard | PayloadMutationResponse<KistlCard>>(
        `${this.cardsApi}?depth=2`,
        {
            name: card.name,
            part: card.part || '',
            plannedPostingDate: card.plannedPostingDate || undefined,
            emojiHints: card.emojiHints || '',
            gifWish: card.gifWish || '',
            textWishes: card.textWishes || '',
            archived: false,
        },
        { withCredentials: true },
        )
        .pipe(
        map((response) => {
            if (this.isPayloadMutationResponse(response)) {
            return response.doc
            }

            return response
        }),
        )
    }

  updateCard(id: string | number, patch: Partial<KistlCard>): Observable<KistlCard> {
    return this.http
      .patch<KistlCard | PayloadMutationResponse<KistlCard>>(
        `${this.cardsApi}/${id}?depth=2`,
        patch,
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          if (this.isPayloadMutationResponse(response)) {
            return response.doc
          }

          return response
        }),
      )
  }

  saveDetails(card: KistlCard): Observable<KistlCard> {
    return this.updateCard(card.id, {
      name: card.name,
      part: card.part,
      plannedPostingDate: card.plannedPostingDate || undefined,
      emojiHints: card.emojiHints,
      gifWish: card.gifWish,
      textWishes: card.textWishes,
      caption: card.caption,
      review: {
        ...(card.review || {}),
        comment: card.review?.comment || '',
    },
    })
  }

  toggleChecklistItem(
    card: KistlCard,
    key: keyof NonNullable<KistlCard['checklist']>,
    checked: boolean,
  ): Observable<KistlCard> {
    return this.updateCard(card.id, {
      checklist: {
        ...(card.checklist || {}),
        [key]: checked,
      },
    })
  }

  archive(card: KistlCard): Observable<KistlCard> {
    return this.updateCard(card.id, {
      archived: true,
    })
  }

  uploadMedia(
    cardId: string | number,
    file: File,
    assetType: NonNullable<KistlMedia['assetType']> = 'other',
  ): Observable<KistlMedia> {
    if (file.size > this.maxUploadSizeBytes) {
      return throwError(
        () =>
          new Error(
            `Die Datei "${file.name}" ist größer als 1 GB und kann nicht hochgeladen werden.`,
          ),
      )
    }

    const formData = new FormData()

    formData.append('file', file)

    formData.append(
      '_payload',
      JSON.stringify({
        card: cardId,
        assetType,
        alt: '',
      }),
    )

    return this.http
      .post<KistlMedia | PayloadMutationResponse<KistlMedia>>(
        `${this.mediaApi}?depth=2`,
        formData,
        { withCredentials: true },
      )
      .pipe(
        map((response) => {
          if (this.isPayloadMutationResponse(response)) {
            return response.doc
          }

          return response
        }),
      )
  }

  private isPayloadMutationResponse<T>(
    response: T | PayloadMutationResponse<T>,
  ): response is PayloadMutationResponse<T> {
    return typeof response === 'object' && response !== null && 'doc' in response
  }
}