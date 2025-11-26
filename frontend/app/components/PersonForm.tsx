"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Person, PersonSchema } from '@/src/core/types';
import { v4 as uuidv4 } from 'uuid';
import TiptapEditor from './Editor';

interface PersonFormProps {
  initialData?: Partial<Person>;
  onSubmit: (data: Person) => void;
  onCancel: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Person>({
    resolver: zodResolver(PersonSchema),
    defaultValues: {
        id: initialData?.id || uuidv4(),
        type: 'person',
        tags: initialData?.tags || [],
        name: {
            first: initialData?.name?.first || '',
            last: initialData?.name?.last || '',
            middle: initialData?.name?.middle || '',
        },
        bio: initialData?.bio || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            {...register('name.first')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm text-black"
          />
          {errors.name?.first && <p className="text-red-500 text-xs mt-1">{errors.name.first.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            {...register('name.last')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm text-black"
          />
          {errors.name?.last && <p className="text-red-500 text-xs mt-1">{errors.name.last.message}</p>}
        </div>
      </div>
      
      <div>
          <label className="block text-sm font-medium text-gray-700">Middle Name</label>
          <input
            {...register('name.middle')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm text-black"
          />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio / Notes</label>
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <TiptapEditor 
              content={field.value || ''} 
              onChange={field.onChange} 
            />
          )}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Person
        </button>
      </div>
    </form>
  );
};
