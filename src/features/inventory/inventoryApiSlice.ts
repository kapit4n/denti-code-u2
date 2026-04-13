import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type {
  ConsultoryDto,
  InventoryMovementDto,
  InventoryMovementType,
  MaterialInventoryLineDto,
} from '@/types';

export type CreateConsultoryBody = {
  Name: string;
  ShortCode?: string;
  SortOrder?: number;
};

export type CreateInventoryLineBody = {
  consultoryId: number;
  facilityId: number;
  initialQuantity?: number;
};

export type AdjustInventoryBody = {
  consultoryId: number;
  facilityId: number;
  amount: number;
  type: InventoryMovementType;
  note?: string;
};

export const inventoryApiSlice = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Consultory', 'InventoryLine', 'InventoryMovement'],
  endpoints: (builder) => ({
    getConsultories: builder.query<ConsultoryDto[], { includeInactive?: boolean } | void>({
      query: (arg) => {
        const q =
          arg && typeof arg === 'object' && arg.includeInactive ? '?includeInactive=true' : '';
        return `/consultories${q}`;
      },
      providesTags: [{ type: 'Consultory', id: 'LIST' }],
    }),
    createConsultory: builder.mutation<ConsultoryDto, CreateConsultoryBody>({
      query: (body) => ({ url: '/consultories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Consultory', id: 'LIST' }],
    }),
    getInventoryLines: builder.query<MaterialInventoryLineDto[], { consultoryId?: number } | void>({
      query: (arg) => {
        const id = arg && 'consultoryId' in arg && arg.consultoryId != null ? arg.consultoryId : undefined;
        const q = id != null ? `?consultoryId=${id}` : '';
        return `/inventory/lines${q}`;
      },
      providesTags: [{ type: 'InventoryLine', id: 'LIST' }],
    }),
    getInventoryMovements: builder.query<
      InventoryMovementDto[],
      { consultoryId?: number; take?: number } | void
    >({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg && 'consultoryId' in arg && arg.consultoryId != null) {
          params.set('consultoryId', String(arg.consultoryId));
        }
        if (arg && 'take' in arg && arg.take != null) params.set('take', String(arg.take));
        const q = params.toString();
        return `/inventory/movements${q ? `?${q}` : ''}`;
      },
      providesTags: [{ type: 'InventoryMovement', id: 'LIST' }],
    }),
    createInventoryLine: builder.mutation<MaterialInventoryLineDto, CreateInventoryLineBody>({
      query: (body) => ({ url: '/inventory/lines', method: 'POST', body }),
      invalidatesTags: [
        { type: 'InventoryLine', id: 'LIST' },
        { type: 'InventoryMovement', id: 'LIST' },
      ],
    }),
    adjustInventory: builder.mutation<MaterialInventoryLineDto, AdjustInventoryBody>({
      query: (body) => ({ url: '/inventory/adjust', method: 'POST', body }),
      invalidatesTags: [
        { type: 'InventoryLine', id: 'LIST' },
        { type: 'InventoryMovement', id: 'LIST' },
      ],
    }),
    deleteInventoryLine: builder.mutation<{ ok: boolean; lineId: number }, number>({
      query: (lineId) => ({ url: `/inventory/lines/${lineId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'InventoryLine', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetConsultoriesQuery,
  useCreateConsultoryMutation,
  useGetInventoryLinesQuery,
  useGetInventoryMovementsQuery,
  useCreateInventoryLineMutation,
  useAdjustInventoryMutation,
  useDeleteInventoryLineMutation,
} = inventoryApiSlice;
