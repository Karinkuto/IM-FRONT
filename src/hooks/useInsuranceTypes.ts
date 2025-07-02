import { useMemo } from 'react';
import { useGetInsuranceTypesQuery } from '@/redux/apis/productApi';
import type { CoverageType as ProductCoverageType } from '@/types/product';
import type { CoverageType as QuotationCoverageType } from '@/types/quotation';

export interface CoverageTypeMap {
  [key: string]: {
    coverageTypeName: string;
    insuranceTypeName: string;
  };
}

interface ProductWithTypes {
  id: string;
  coverageType?: string;
  insuranceType?: string;
  [key: string]: unknown;
}

export const useInsuranceTypes = () => {
  const { data, isLoading, error } = useGetInsuranceTypesQuery();

  const coverageTypesMap = useMemo<CoverageTypeMap>(() => {
    if (!data?.data) {
      return {};
    }

    return data.data.reduce<CoverageTypeMap>((acc, insuranceType) => {
      if (!insuranceType.coverage_types) {
        return acc;
      }

      for (const coverageType of insuranceType.coverage_types) {
        const coverageTypeId = 'id' in coverageType ? coverageType.id : String(coverageType);
        const coverageTypeName = 'name' in coverageType ? coverageType.name : 'Unknown';
        
        acc[coverageTypeId] = {
          coverageTypeName,
          insuranceTypeName: insuranceType.name,
        };
      }

      return acc;
    }, {});
  }, [data?.data]);

  const getInsuranceTypeById = (id: string) => {
    return data?.data?.find(type => type.id === id);
  };

  const getCoverageTypeById = (id: string) => {
    if (!data?.data) {
      return null;
    }
    
    for (const insuranceType of data.data) {
      if (!insuranceType.coverage_types) {
        continue;
      }
      
      const coverageType = insuranceType.coverage_types.find(
        (ct: ProductCoverageType | QuotationCoverageType | string) => {
          if (typeof ct === 'string') {
            return ct === id;
          }
          // Handle both number and string IDs
          return String(ct.id) === id;
        }
      );
      
      if (coverageType) {
        if (typeof coverageType === 'string') {
          return {
            id,
            name: 'Unknown',
            insuranceTypeName: insuranceType.name
          };
        }
        return {
          id: String(coverageType.id), // Ensure id is always a string
          name: coverageType.name,
          ...('description' in coverageType && { description: coverageType.description }),
          insuranceTypeName: insuranceType.name
        };
      }
    }
    
    return null;
  };

  const getProductTypeInfo = (product: ProductWithTypes) => {
    if (!product.coverageType) {
      return null;
    }
    
    const coverageInfo = coverageTypesMap[product.coverageType];
    if (!coverageInfo) {
      return null;
    }

    return {
      insuranceType: {
        id: product.insuranceType || '',
        name: coverageInfo.insuranceTypeName,
      },
      coverageType: {
        id: product.coverageType,
        name: coverageInfo.coverageTypeName,
      }
    };
  };

  const getCoverageTypesByInsuranceType = (insuranceTypeId: string) => {
    const insuranceType = getInsuranceTypeById(insuranceTypeId);
    if (!insuranceType?.coverage_types) {
      return [];
    }

    return insuranceType.coverage_types.map((ct: ProductCoverageType | QuotationCoverageType | string) => {
      if (typeof ct === 'string') {
        return { id: ct, name: 'Unknown' };
      }
      // Handle both ProductCoverageType and QuotationCoverageType
      return {
        id: String(ct.id), // Ensure id is always a string
        name: ct.name,
        ...('description' in ct && { description: ct.description })
      };
    });
  };

  const isValidCoverageForInsurance = (insuranceTypeId: string, coverageTypeId: string) => {
    const coverageTypes = getCoverageTypesByInsuranceType(insuranceTypeId);
    return coverageTypes.some(ct => ct.id === coverageTypeId);
  };

  return {
    insuranceTypes: data?.data || [],
    coverageTypesMap,
    isLoading,
    error,
    getInsuranceTypeById,
    getCoverageTypeById,
    getProductTypeInfo,
    getCoverageTypesByInsuranceType,
    isValidCoverageForInsurance,
  };
};
