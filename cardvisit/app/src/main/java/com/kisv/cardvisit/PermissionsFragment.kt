package com.kisv.cardvisit

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.fragment.app.Fragment
import androidx.core.content.ContextCompat
import androidx.navigation.Navigation

private const val MY_PERMISSIONS_REQUEST_CAMERA = 77
private val PERMISSIONS_REQUIRED = arrayOf(Manifest.permission.CAMERA)

class PermissionsFragment : Fragment() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if(!hasPermissions(requireContext())) {
            requestPermissions(
                PERMISSIONS_REQUIRED,
                MY_PERMISSIONS_REQUEST_CAMERA
            )
        } else {
            navigateToCameraFragment()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if(requestCode == MY_PERMISSIONS_REQUEST_CAMERA) {
            if(PackageManager.PERMISSION_GRANTED == grantResults.firstOrNull()) {
                navigateToCameraFragment()
            }
        }
    }

    private fun navigateToCameraFragment() {
        Navigation.findNavController(requireActivity(), R.id.fragment_container_view)
            .navigate(PermissionsFragmentDirections.actionPermissionsToCamera())
    }

    companion object {
        fun hasPermissions(context: Context) = PERMISSIONS_REQUIRED.all {
            ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
        }
    }

}
