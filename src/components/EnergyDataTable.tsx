'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Badge,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridRowModes,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  SaveAlt as SaveAllIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { EnergyData, EnergyDataCreate } from '@/types/energy';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToJSON,
  exportToXML,
  importFromCSV,
} from '@/utils/exportImport';

interface EnergyDataTableProps {
  data: EnergyData[];
  onDataChange: (newData: EnergyData[]) => void;
}

const EnergyDataTable: React.FC<EnergyDataTableProps> = ({ data, onDataChange }) => {
  const t = useTranslations('table');
  const tMonths = useTranslations('months');



  // Function to translate month names
  const translateMonth = (monthYear: string) => {
    // Extract month name from "January 2024" format
    const [monthName, year] = monthYear.split(' ');
    const translatedMonth = tMonths(monthName as keyof typeof tMonths);
    return `${translatedMonth} ${year}`;
  };



  const [editingRows, setEditingRows] = useState<GridRowId[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<GridRowId | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // New state for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, EnergyData>>({});
  const [workingData, setWorkingData] = useState<EnergyData[]>(data);

  const [filters, setFilters] = useState({
    minConsumption: '',
    maxConsumption: '',
    minCost: '',
    maxCost: '',
  });
  const [newRow, setNewRow] = useState<EnergyDataCreate>({
    date: '',
    energyConsumption: 0,
    energyCost: 0,
    energySaved: 0,
    moneySaved: 0,
  });
  const [newRowDate, setNewRowDate] = useState<Dayjs | null>(null);

  // Update working data when props change
  React.useEffect(() => {
    setWorkingData(data);
    setUnsavedChanges({});
  }, [data]);

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  const filteredData = useMemo(() => {
    return workingData.filter(item => {
      if (filters.minConsumption && item.energyConsumption < Number(filters.minConsumption)) return false;
      if (filters.maxConsumption && item.energyConsumption > Number(filters.maxConsumption)) return false;
      if (filters.minCost && item.energyCost < Number(filters.minCost)) return false;
      if (filters.maxCost && item.energyCost > Number(filters.maxCost)) return false;
      return true;
    });
  }, [workingData, filters]);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setEditingRows([id]);
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setEditingRows(editingRows.filter(rowId => rowId !== id));
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setDeleteRowId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteRowId) {
      const rowToDelete = workingData.find(row => row.id === deleteRowId);
      const newData = workingData.filter(row => row.id !== deleteRowId);
      setWorkingData(newData);

      // Remove from unsaved changes if it was there
      const newUnsavedChanges = { ...unsavedChanges };
      delete newUnsavedChanges[deleteRowId.toString()];
      setUnsavedChanges(newUnsavedChanges);

      setSnackbarMessage(`Energy record for ${rowToDelete?.date} deleted (unsaved)`);
      setShowSnackbar(true);
    }
    setShowDeleteDialog(false);
    setDeleteRowId(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteRowId(null);
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setEditingRows(editingRows.filter(rowId => rowId !== id));

    // Revert changes for this row
    const originalRow = data.find(row => row.id === id);
    if (originalRow) {
      const newWorkingData = workingData.map(row =>
        row.id === id ? originalRow : row
      );
      setWorkingData(newWorkingData);

      // Remove from unsaved changes
      const newUnsavedChanges = { ...unsavedChanges };
      delete newUnsavedChanges[id.toString()];
      setUnsavedChanges(newUnsavedChanges);
    }
  };

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const updatedData = workingData.map(row => {
        if (row.id === newRow.id) {
          return { ...newRow } as EnergyData;
        }
        return row;
      });
      setWorkingData(updatedData);

      // Track this as an unsaved change
      setUnsavedChanges(prev => ({
        ...prev,
        [newRow.id.toString()]: newRow as EnergyData
      }));

      setSnackbarMessage(t('changesDetected'));
      setShowSnackbar(true);
      return newRow;
    },
    [workingData, t]
  );

  const handleSaveAllChanges = () => {
    onDataChange(workingData);
    setUnsavedChanges({});
    setSnackbarMessage(`Successfully saved ${Object.keys(unsavedChanges).length} changes`);
    setShowSnackbar(true);
  };

  const handleDiscardAllChanges = () => {
    setWorkingData(data);
    setUnsavedChanges({});
    setEditingRows([]);
    setSnackbarMessage('All unsaved changes discarded');
    setShowSnackbar(true);
  };

  const handleAddRow = () => {
    if (!newRowDate || newRow.energyConsumption <= 0) {
      setSnackbarMessage('Please fill in all required fields');
      setShowSnackbar(true);
      return;
    }

    const id = `energy-${Date.now()}`;
    const formattedDate = newRowDate.format('MMMM YYYY');
    const newData: EnergyData = {
      ...newRow,
      id,
      date: formattedDate,
      savingsPercentage: 0, // Will be recalculated
    };

    const updatedData = [...workingData, newData];
    setWorkingData(updatedData);

    // Track as unsaved change
    setUnsavedChanges(prev => ({
      ...prev,
      [id]: newData
    }));

    setShowAddDialog(false);
    setNewRow({
      date: '',
      energyConsumption: 0,
      energyCost: 0,
      energySaved: 0,
      moneySaved: 0,
    });
    setNewRowDate(null);
    setSnackbarMessage(`Energy record for ${formattedDate} added (unsaved)`);
    setShowSnackbar(true);
  };

  const handleExport = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `energy-data-${timestamp}`;

    switch (format) {
      case 'csv':
        exportToCSV(filteredData, `${filename}.csv`);
        break;
      case 'excel':
        exportToExcel(filteredData, `${filename}.xlsx`);
        break;
      case 'pdf':
        exportToPDF(filteredData, `${filename}.pdf`);
        break;
      case 'json':
        exportToJSON(filteredData, `${filename}.json`);
        break;
      case 'xml':
        exportToXML(filteredData, `${filename}.xml`);
        break;
    }
    setShowExportDialog(false);
    setSnackbarMessage(`Data exported as ${format.toUpperCase()} (${filteredData.length} records)`);
    setShowSnackbar(true);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.csv')) {
        const importedData = await importFromCSV(file);
        const updatedData = [...workingData, ...importedData];
        setWorkingData(updatedData);

        // Track imported data as unsaved changes
        const newUnsavedChanges = { ...unsavedChanges };
        importedData.forEach(row => {
          newUnsavedChanges[row.id] = row;
        });
        setUnsavedChanges(newUnsavedChanges);

        setSnackbarMessage(`Successfully imported ${importedData.length} energy records (unsaved)`);
        setShowSnackbar(true);
      } else {
        setSnackbarMessage('Only CSV files are supported for import');
        setShowSnackbar(true);
      }
    } catch {
      setSnackbarMessage('Error importing file. Please check the file format.');
      setShowSnackbar(true);
    }
    // Reset file input
    event.target.value = '';
  };

  const getSavingsIndicator = (percentage: number) => {
    const isPositive = percentage >= 10;
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          width={12}
          height={12}
          bgcolor={isPositive ? 'success.main' : 'error.main'}
          borderRadius="50%"
          title={isPositive ? t('excellentSavings') : t('needsImprovement')}
        />
        <Typography variant="body2" color={isPositive ? 'success.main' : 'error.main'}>
          {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  // Custom date edit component
  const DateEditCell = (params: GridRenderEditCellParams) => {
    const handleDateChange = (newValue: Dayjs | null) => {
      if (newValue) {
        const formattedDate = newValue.format('MMMM YYYY');
        params.api.setEditCellValue({ id: params.id, field: params.field, value: formattedDate });
      }
    };

    const currentValue = dayjs(params.value, 'MMMM YYYY');

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={currentValue.isValid() ? currentValue : null}
          onChange={handleDateChange}
          views={['year', 'month']}
          format="MMMM YYYY"
          slotProps={{
            textField: {
              variant: 'standard',
              fullWidth: true,
              size: 'small',
            },
          }}
        />
      </LocalizationProvider>
    );
  };

  const getRowClassName = (params: { id: GridRowId }) => {
    const isUnsaved = unsavedChanges[params.id.toString()];
    return isUnsaved ? 'unsaved-row' : '';
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: t('month'),
      width: 150,
      editable: true,
      renderEditCell: DateEditCell,
      renderCell: ({ value }) => translateMonth(value as string),
    },
    {
      field: 'energyConsumption',
      headerName: t('consumption'),
      width: 200,
      type: 'number',
      editable: true,
      renderCell: ({ value }) => `${value || 0} kWh`,
    },
    {
      field: 'energyCost',
      headerName: t('cost'),
      width: 150,
      type: 'number',
      editable: true,
      renderCell: ({ value }) => `$${(value || 0).toFixed(2)}`,
    },
    {
      field: 'energySaved',
      headerName: t('saved'),
      width: 170,
      type: 'number',
      editable: true,
      renderCell: ({ value }) => `${value || 0} kWh`,
    },
    {
      field: 'moneySaved',
      headerName: t('moneySaved'),
      width: 150,
      type: 'number',
      editable: true,
      renderCell: ({ value }) => `$${(value || 0).toFixed(2)}`,
    },
    {
      field: 'savingsPercentage',
      headerName: t('savingsPercentage'),
      width: 200,
      renderCell: ({ value }) => getSavingsIndicator(value as number),
      sortable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = editingRows.includes(id);

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label={t('save')}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label={t('cancel')}
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label={t('edit')}
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label={t('delete')}
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ];



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" component="h1">
              {t('title')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDialog(true)}
              >
                {t('addNewRecord')}
              </Button>

              {/* Save/Discard buttons */}
              {hasUnsavedChanges && (
                <>
                  <Badge badgeContent={Object.keys(unsavedChanges).length} color="warning">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveAllIcon />}
                      onClick={handleSaveAllChanges}
                    >
                      {t('saveAllChanges')}
                    </Button>
                  </Badge>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<UndoIcon />}
                    onClick={handleDiscardAllChanges}
                  >
                    {t('undoAllChanges')}
                  </Button>
                </>
              )}

              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilterDialog(true)}
              >
                {t('filter')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => setShowExportDialog(true)}
              >
                {t('export')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                component="label"
              >
                {t('import')} CSV
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleImport}
                />
              </Button>
            </Stack>
          </Stack>

          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {t('unsavedChanges')}
              </Typography>
            </Alert>
          )}

          <DataGrid
            rows={filteredData}
            columns={columns}
            editMode="row"
            rowModesModel={Object.fromEntries(
              editingRows.map(id => [id, { mode: GridRowModes.Edit }])
            )}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            getRowClassName={getRowClassName}
            sx={{
              height: 600,
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .unsaved-row': {
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 193, 7, 0.2)',
                },
              },
            }}
          />
        </Paper>

        {/* Add Row Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('addNewRecord')}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <DatePicker
                label={t('date')}
                value={newRowDate}
                onChange={(newValue) => setNewRowDate(newValue)}
                views={['year', 'month']}
                format="MMMM YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              <TextField
                label={t('energyConsumptionKwh')}
                type="number"
                value={newRow.energyConsumption}
                onChange={(e) => setNewRow({ ...newRow, energyConsumption: Number(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('energyCostDollar')}
                type="number"
                value={newRow.energyCost}
                onChange={(e) => setNewRow({ ...newRow, energyCost: Number(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label={t('energySavedKwh')}
                type="number"
                value={newRow.energySaved}
                onChange={(e) => setNewRow({ ...newRow, energySaved: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('moneySavedDollar')}
                type="number"
                value={newRow.moneySaved}
                onChange={(e) => setNewRow({ ...newRow, moneySaved: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddRow} variant="contained">{t('add')}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            {t('confirmDelete')}
          </DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              {t('deleteWarning')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('deleteNote')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>{t('cancel')}</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              {t('delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
          <DialogTitle>{t('exportData')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('selectFormat')}
            </Typography>
            <Stack spacing={1}>
              <Button onClick={() => handleExport('csv')} fullWidth variant="outlined">
                {t('csv')}
              </Button>
              <Button onClick={() => handleExport('excel')} fullWidth variant="outlined">
                {t('excel')}
              </Button>
              <Button onClick={() => handleExport('pdf')} fullWidth variant="outlined">
                {t('pdf')}
              </Button>
              <Button onClick={() => handleExport('json')} fullWidth variant="outlined">
                {t('json')}
              </Button>
              <Button onClick={() => handleExport('xml')} fullWidth variant="outlined">
                {t('xml')}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t('filterData')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('filterDescription')}
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label={t('minConsumption')}
                type="number"
                value={filters.minConsumption}
                onChange={(e) => setFilters({ ...filters, minConsumption: e.target.value })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('maxConsumption')}
                type="number"
                value={filters.maxConsumption}
                onChange={(e) => setFilters({ ...filters, maxConsumption: e.target.value })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('minCost')}
                type="number"
                value={filters.minCost}
                onChange={(e) => setFilters({ ...filters, minCost: e.target.value })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label={t('maxCost')}
                type="number"
                value={filters.maxCost}
                onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilters({ minConsumption: '', maxConsumption: '', minCost: '', maxCost: '' })}>
              {t('close')}
            </Button>
            <Button onClick={() => setShowFilterDialog(false)} variant="contained">{t('apply')}</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setShowSnackbar(false)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EnergyDataTable; 